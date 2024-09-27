<!-- src\routes\(sidebar)\crud\tasks\+page.svelte -->
<script lang="ts">
	import { Modal, Heading, Button } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { QuestionCircleOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';

	import spinner from '$lib/assets/pcic-spinner.gif';
	import jsPDF from 'jspdf';
	import Papa from 'papaparse';

	import Task from '$lib/utils/tasks/Task.svelte';
	import Delete from '$lib/utils/tasks/Delete.svelte';
	import Toast from '$lib/utils/widgets/Toast.svelte';
	import MetaTag from '$lib/utils/general/MetaTag.svelte';
	import TaskToolbar from '$lib/utils/tasks/TaskToolbar.svelte';
	import TaskTable from '$lib/utils/tasks/TaskTable.svelte';
	import SyncModal from '$lib/utils/tasks/SyncModal.svelte';
	import ConfirmationModal from '$lib/utils/tasks/ConfirmationModal.svelte';

	let isSyncing = false;
	let isScanning = false;
	let taskModalOpen: boolean = false;
	let deleteModalOpen: boolean = false;
	let secondaryModalOpen = false;
	let open: boolean = false;
	let modalType: string = 'clear_forms';

	const path: string = '/c/tasks';
	const description: string = 'CRUD productsPCIC Web Dashboard';
	const title: string = 'PCIC Web Dashboard';
	const subtitle: string = 'CRUD Products';
	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	let isLoading = true;

	export let data;

	let formView = '';

	let users: any[] = [];
	let tasks: any[] = [];
	let current_user: any = {};
	let selected_task: any = {};
	let statusFilter: string = 'all';
	let search: string = '';
	let confirm_delete: string = '';
	let completeModalOpen = false;
	let resetModalOpen = false;
	let filteredTasks: any[] = [];
	let sortings: any[] = [];
	let toastProps: {
		show: boolean;
		message: string;
		type: 'success' | 'error' | 'info' | 'warning';
	} = {
		show: false,
		message: '',
		type: 'success'
	};

	let maxPageItems = 10;
	let currentPage = 1;

	let selectedTasks: any[] = [];

	let isNational = false;

	let currentlySyncing: any = null;

	let scannedFiles: any = {};

	let regions: any[];

	$: ({ supabase } = data);

	onMount(async () => {
		current_user = (await supabase.auth.getUser()).data.user;
		const { data: user, error } = await supabase
			.from('users')
			.select('role')
			.eq('id', current_user.id)
			.single();
		isNational = user?.role == 'National_Admin';
		await fetchUsers();
		await fetchTasks();
		await fetchRegions();
	});

	const handleConfirmDelete = (event: any) => {
		confirm_delete = event.target.value;
	};

	const handleStatusChange = (status: string) => {
		statusFilter = status;
		currentPage = 1;
		sortFilterTasks();
	};

	const fetchRegions = async () => {
		try {
			const { data: regionsData, error } = await supabase
				.from('regions')
				.select('id, region_name, region_code');

			if (error) {
				console.error('Supabase error when fetching regions:', error);
				throw error;
			}

			regions = regionsData;

			if (regions.length === 0) {
				console.warn(
					'No regions fetched from the database. Please check if the regions table has data.'
				);
				showToast('Error fetching regions', 'error');
			}
		} catch (error) {
			showToast('Error fetching regions', 'error');
		}
	};

	const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
		toastProps = { show: true, message, type };
		setTimeout(() => {
			toastProps = { ...toastProps, show: false };
		}, 3000);
	};

	const selectTasks = (task: any) => {
		if (!selectedTasks.includes(task)) {
			selectedTasks.push(task);
			selectedTasks = selectedTasks;
		} else {
			selectedTasks = selectedTasks.filter((_task) => _task !== task);
		}
	};

	const selectAllTasks = () => {
		if (selectedTasks.length >= filteredTasks.length) {
			selectedTasks = [];
		} else {
			selectedTasks = [...filteredTasks];
		}
	};

	const getPriorityIndex = (priority: string) => {
		const priorityMap: { [key: string]: number } = {
			high: 3,
			medium: 2,
			low: 1,
			'normal priority': 1.5
		};

		return priorityMap[priority.toLowerCase()];
	};

	const sortFilterTasks = () => {
		console.log('Current statusFilter:', statusFilter);
		console.log('Tasks before filtering:', tasks.length);

		filteredTasks = tasks.filter((task) => {
			return (
				statusFilter.toLowerCase() === 'all' ||
				task.status.toLowerCase() === statusFilter.toLowerCase()
			);
		});

		console.log('Tasks after status filtering:', filteredTasks.length);

		filteredTasks = filteredTasks.filter(
			(task) =>
				task.task_number.toLowerCase().includes(search.toLowerCase()) ||
				task.users.inspector_name.toLowerCase().includes(search.toLowerCase()) ||
				task.service_type.toLowerCase().includes(search.toLowerCase()) ||
				task.service_group.toLowerCase().includes(search.toLowerCase())
		);

		console.log('Tasks after search filtering:', filteredTasks.length);

		selectedTasks = selectedTasks.filter((_task) => filteredTasks.includes(_task));

		for (const sort of sortings) {
			switch (sort) {
				case 'Task Name Desc':
					filteredTasks = filteredTasks.sort((a, b) => b.task_number.localeCompare(a.task_number));
					break;
				case 'Service Type Desc':
					filteredTasks = filteredTasks.sort((a, b) =>
						b.service_type.localeCompare(a.service_type)
					);
					break;
				case 'Priority Desc':
					filteredTasks = filteredTasks.sort(
						(a, b) => getPriorityIndex(b.priority) - getPriorityIndex(a.priority)
					);
					break;
				case 'Task Name Asc':
					filteredTasks = filteredTasks.sort((a, b) => a.task_number.localeCompare(b.task_number));
					break;
				case 'Service Type Asc':
					filteredTasks = filteredTasks.sort((a, b) =>
						a.service_type.localeCompare(b.service_type)
					);
					break;
				case 'Priority Asc':
					filteredTasks = filteredTasks.sort(
						(a, b) => getPriorityIndex(a.priority) - getPriorityIndex(b.priority)
					);
					break;
			}
		}

		console.log('Final filtered tasks:', filteredTasks.length);
		currentPage = 1;
	};

	const filterBySearch = (event: any) => {
		search = event.target.value.toLowerCase();
		currentPage = 1;
		sortFilterTasks();
	};

	const setStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'completed':
				return 'text-green-500';
			case 'ongoing':
				return 'text-blue-500';
			case 'for dispatch':
				return 'text-yellow-500';
			default:
				return 'text-gray-500';
		}
	};

	const setPriorityColor = (priority: string) => {
		switch (priority.toLowerCase()) {
			case 'high':
				return 'text-red-500';
			case 'medium':
				return 'text-orange-500';
			case 'low':
				return 'text-yellow-500';
			default:
				return 'text-gray-500';
		}
	};

	const clearPPICForm = async (taskID: string) => {
		const form_response = await supabase
			.from('ppir_forms')
			.update({
				ppir_att_1: null,
				ppir_att_2: null,
				ppir_att_3: null,
				ppir_att_4: null,
				ppir_area_act: null,
				ppir_dopds_act: null,
				ppir_doptp_act: null,
				ppir_svp_act: null,
				ppir_variety: null,
				ppir_stagecrop: null,
				ppir_remarks: null,
				ppir_name_insured: null,
				ppir_name_iuia: null,
				ppir_sig_insured: null,
				ppir_sig_iuia: null
			})
			.eq('task_id', taskID);
		const task_response = await supabase
			.from('tasks')
			.update({
				status: 'for dispatch'
			})
			.eq('id', taskID);
		if (form_response.error || task_response.error) {
			showToast('Error in resetting PPIR Form!', 'error');
			return;
		}

		await fetchTasks();

		showToast('Successfully reset PPIR Form!', 'success');
	};

	const markAsComplete = async (taskID: string) => {
		const { data, error } = await supabase
			.from('tasks')
			.update({
				status: 'completed'
			})
			.eq('id', taskID);

		if (error) {
			showToast('Error in marking task as completed!', 'error');
			return false;
		}
		await fetchTasks();
		showToast('Successfully marked as completed', 'success');
		return true;
	};

	const upsertTask = async (upsertData: any, row: any = {}, create: boolean = false) => {
		if (create) {
			const { data: existingRow, error: selectError } = await supabase
				.from('ppir_forms')
				.select('ppir_insuranceid')
				.eq('ppir_insuranceid', row['ppir_insuranceid']);

			if (existingRow) {
				showToast(`PPIR Insurance ID already exists`, 'error');
				return false;
			}
			alert(JSON.stringify(selectError));
		}

		const invalidData = Object.keys(upsertData).find(
			(key) => key != 'id' && (upsertData[key] == null || upsertData[key].trim() == '')
		);
		if (invalidData) {
			showToast(`${invalidData.toUpperCase().replaceAll('_', ' ')} is required!`, 'error');
			return false;
		}

		if (row['ppir_insuranceid'] == null || row['ppir_assignmentid'] == null) {
			showToast(`PPIR Insurance ID and Assignment ID must be set!`, 'error');
			return false;
		}

		const { data: taskData, error } = await supabase
			.from('tasks')
			.upsert(upsertData)
			.select(
				`
                    *,
                    users (
                        id,inspector_name
                    )
                `
			)
			.single();
		if (error) {
			showToast('Error in processing data!', 'error');
			return false;
		}

		const form_response = await supabase.from('ppir_forms').upsert({
			task_id: taskData.id,
			ppir_assignmentid: row['ppir_assignmentid'],
			ppir_insuranceid: row['ppir_insuranceid'],
			ppir_farmername: row['ppir_farmername'],
			ppir_address: row['ppir_address'],
			ppir_farmertype: row['ppir_farmertype'],
			ppir_mobileno: row['ppir_mobileno'],
			ppir_groupname: row['ppir_groupname'],
			ppir_groupaddress: row['ppir_groupaddress'],
			ppir_lendername: row['ppir_lendername'],
			ppir_lenderaddress: row['ppir_lenderaddress'],
			ppir_cicno: row['ppir_cicno'],
			ppir_farmloc: row['ppir_farmloc'],
			ppir_north: row['ppir_north'],
			ppir_south: row['ppir_south'],
			ppir_east: row['ppir_east'],
			ppir_west: row['ppir_west'],
			ppir_area_aci: row['ppir_area_aci'],
			ppir_dopds_aci: row['ppir_dopds_aci'],
			ppir_doptp_aci: row['ppir_doptp_aci'],
			ppir_svp_aci: row['ppir_svp_aci']
		});
		if (form_response.error) {
			showToast('Error processing task', 'error');
			return false;
		}

		await fetchTasks();
		if (upsertData.id != null) {
			showToast('Successfully updated task', 'success');
		} else {
			showToast('Successfully added task', 'success');
		}
		return true;
	};

	const deleteTask = async (rowId: string) => {
		try {
			const { data, error } = await supabase.from('tasks').delete().eq('id', rowId);

			if (error) {
				showToast('Error in deleting task!', 'error');
				console.error('Error deleting row:', error.message);
				return;
			}
			await fetchTasks();
			showToast('Successfully deleted task', 'success');
		} catch (error) {
			console.error('Error deleting row:', error);
		}
	};

	const fetchUsers = async () => {
		try {
			const { data, error } = await supabase
				.from('users')
				.select(
					`
                    *,
                    regions (
                        region_name
                    )
                `
				)
				.neq('auth_user_id', current_user.id)
				.order('created_at', { ascending: false });

			if (error) {
				showToast('Error in fetching users', 'error');
				throw error;
			}
			users = data;
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	};

	const fetchTasks = async () => {
		try {
			const { data, error } = await supabase
				.from('tasks')
				.select(
					`
                    *,
					ppir_forms (*),
                    users (
                        id,inspector_name,email
                    )
                `
				)
				.order('task_number', { ascending: true });
			if (error) {
				showToast('Error in fetching users', 'error');
				throw error;
			}
			tasks = data;
			filteredTasks = tasks;
			sortFilterTasks();
		} catch (error) {
			console.error('Error fetching tasks:', error);
		} finally {
			isLoading = false;
		}
	};

	const generateFormView = (task: any, download: boolean = false) => {
		const data = task.ppir_forms;
		data.task_number = task.task_number;
		const doc = new jsPDF();
		const taskNumber = data.task_number || 'Unknown Task';
		doc.setFontSize(16);
		doc.setFont('', 'bold');
		doc.text(`${taskNumber}`, 10, 15);

		const fields = [
			'ppir_assignmentid',
			'ppir_dopds_act',
			'ppir_insuranceid',
			'ppir_doptp_act',
			'ppir_farmername',
			'ppir_doptp_aci',
			'ppir_address',
			'ppir_svp_aci',
			'ppir_farmertype',
			'ppir_svp_act',
			'ppir_mobile_no',
			'ppir_variety',
			'ppir_groupname',
			'ppir_stage_crop',
			'ppir_groupaddress',
			'ppir_remarks',
			'ppir_lendername',
			'ppir_name_insured',
			'ppir_lenderaddress',
			'ppir_name_iuia',
			'ppir_cicno',
			'ppir_farmloc',
			'ppir_north',
			'ppir_south',
			'ppir_east',
			'ppir_west',
			'ppir_att_1',
			'ppir_att_2',
			'ppir_att_3',
			'ppir_att_4',
			'ppir_area_aci',
			'ppir_area_act',
			'ppir_dopds_aci'
		];

		let yPos = 30;
		const lineHeight = 10;
		const pageHeight = doc.internal.pageSize.height;
		const columnWidth = 95;
		let column = 1;
		doc.setFontSize(11);

		fields.forEach((field, index) => {
			let value = data[field];
			if (value == null || value == '') {
				value = 'NOT SET';
			}
			const label = field
				.replace(/^ppir_/, '')
				.replace(/_/g, ' ')
				.toUpperCase();

			doc.setFont('', 'bold');
			doc.text(`${label}:`, (column - 1) * columnWidth + (column == 1 ? 10 : 20), yPos);

			doc.setFont('', 'normal');
			doc.text(`____________________________`, (column - 1) * columnWidth + 50, yPos);
			doc.text(value, (column - 1) * columnWidth + 50, yPos);

			yPos += lineHeight;

			if (yPos + lineHeight > pageHeight - 70 && column === 1) {
				column = 2;
				yPos = 30;
			} else if (yPos + lineHeight > pageHeight - 70 && column === 2) {
				doc.addPage();
				column = 1;
				yPos = 30;
			}
		});

		yPos = pageHeight - 50;

		if (data.ppir_sig_insured) {
			const sigInsuredImg = `data:image/png;base64,${data.ppir_sig_insured}`;

			doc.setLineWidth(0.5);
			doc.rect(65, yPos - 30, 60, 30);

			doc.text('SIGNATURE OF INSURED:', 10, yPos - 15);
			doc.addImage(sigInsuredImg, 'PNG', 70, yPos - 25, 50, 20);
			yPos += 40;
		}

		if (data.ppir_sig_iuia) {
			const sigIUIAImg = `data:image/png;base64,${data.ppir_sig_iuia}`;

			doc.setLineWidth(0.5);
			doc.rect(65, yPos - 30, 60, 30);

			doc.text('SIGNATURE OF IU/IA:', 10, yPos - 15);
			doc.addImage(sigIUIAImg, 'PNG', 70, yPos - 25, 50, 20);
		}
		if (download) {
			doc.save(`${data.task_number}-${data.ppir_assignmentid}.pdf`);
		}
		return doc.output('datauristring');
	};

	async function scanFTP() {
		isScanning = true;
		showToast('Starting FTP server scan...', 'info');
		try {
			const directory = '/Work';
			const fetched_list = await fetch('/api/list-directory', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ directory })
			});

			if (!fetched_list.ok) {
				throw new Error(`Error fetching files: ${fetched_list.statusText}`);
			}

			const fileList = await fetched_list.json();
			let totalFiles = 0;
			let processedFiles = 0;

			for (const file of fileList) {
				if (file.name.endsWith('.csv')) {
					totalFiles++;
					try {
						showToast(`Processing file: ${file.name}`, 'info');
						scannedFiles[file.name] = {
							rows: [],
							synced: [],
							scanning: true,
							length: 0
						};

						const fetched_file = await fetch('/api/get-file', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ filePath: `${directory}/${file.name}` })
						});

						if (!fetched_file.ok) {
							throw new Error(`Error fetching file ${file.name}: ${fetched_file.statusText}`);
						}

						const csvData = await fetched_file.text();
						const parsedData = Papa.parse(csvData, { header: true, skipEmptyLines: true });
						scannedFiles[file.name].length = parsedData.data.length;

						for (const row of parsedData.data as any[]) {
							const ppirInsuranceId = row['ppir_insuranceid'];
							const { data: existingRow, error: selectError } = await supabase
								.from('ppir_forms')
								.select('ppir_insuranceid')
								.eq('ppir_insuranceid', ppirInsuranceId)
								.single();

							if (selectError && selectError.code !== 'PGRST116') {
								console.error(
									`Error checking existence of ${ppirInsuranceId} in ppir_forms:`,
									selectError
								);
								showToast(`Error checking PPIR form: ${ppirInsuranceId}`, 'error');
							} else if (existingRow) {
								scannedFiles[file.name].synced.push(row);
							} else {
								scannedFiles[file.name].rows.push(row);
							}
						}

						scannedFiles[file.name].scanning = false;
						processedFiles++;
						showToast(`Processed ${processedFiles} of ${totalFiles} files`, 'info');
					} catch (fileError) {
						console.error(`Error processing file ${file.name}:`, fileError);
						showToast(`Error processing file: ${file.name}`, 'error');
					}
				}
			}
			showToast(`Scan completed. ${processedFiles} files processed.`, 'success');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'An unknown error occurred';
			console.error('Scan failed:', message);
			showToast(`Scan failed: ${message}`, 'error');
		} finally {
			isScanning = false;
		}
	}

	async function syncWithFTP() {
		isSyncing = true;
		showToast('Starting database sync...', 'info');
		try {
			let totalSynced = 0;
			let totalErrors = 0;

			for (const file of Object.keys(scannedFiles)) {
				if (file.endsWith('.csv')) {
					showToast(`Syncing file: ${file}`, 'info');
					currentlySyncing = file;

					const { data: existingFile, error: fileCheckError } = await supabase
						.from('file_read')
						.select('*')
						.eq('file_name', file)
						.single();

					if (fileCheckError && fileCheckError.code !== 'PGRST116') {
						console.error(`Error checking existence of file ${file}:`, fileCheckError);
						continue;
					}

					let fileReadId;
					if (existingFile) {
						fileReadId = existingFile.id;
					} else {
						const { data: fileReadData, error: fileReadError } = await supabase
							.from('file_read')
							.insert([{ file_name: file, file_type: 'csv' }])
							.select('id')
							.single();

						if (fileReadError) {
							console.error(`Error inserting data into file_read for ${file}:`, fileReadError);
							continue;
						}
						fileReadId = fileReadData.id;
					}

					for (const row of scannedFiles[file].rows) {
						try {
							const assigneeEmail = row['Assignee'];
							let assigneeId;
							const { data: existingUser, error: userSelectError } = await supabase
								.from('users')
								.select('*')
								.eq('email', assigneeEmail)
								.single();

							if (userSelectError && userSelectError.code !== 'PGRST116') {
								console.error(
									`Error checking existence of user ${assigneeEmail}:`,
									userSelectError
								);
								showToast('System Error: Error checking existence new user', 'error');
								continue;
							}

							if (existingUser) {
								assigneeId = existingUser.id;
							} else {
								const { data: authData, error: authError } = await supabase.auth.admin.createUser({
									email: assigneeEmail,
									password: '1'
								});

								if (!authData.user) {
									console.error(`Error creating new user for ${assigneeEmail}`);
									showToast('System Error: Error creating new user', 'error');
									continue;
								}

								assigneeId = authData.user.id;
							}

							const ppirInsuranceId = row['ppir_insuranceid'];
							const { data: existingRow, error: selectError } = await supabase
								.from('ppir_forms')
								.select('ppir_insuranceid')
								.eq('ppir_insuranceid', ppirInsuranceId)
								.single();

							if (selectError && selectError.code !== 'PGRST116') {
								console.error(
									`Error checking existence of ${ppirInsuranceId} in ppir_forms:`,
									selectError
								);
								showToast('System Error: Error checking existence of ppir_form', 'error');
								continue;
							}

							if (!existingRow) {
								const { data: taskData, error: taskError } = await supabase
									.from('tasks')
									.insert([
										{
											task_number: `Task-${row['ppir_assignmentid']}`,
											service_type: row['Service Type'],
											service_group: row['Service Group'].replace('0', 'O'),
											priority: row['Priority'],
											assignee: assigneeId,
											file_id: fileReadId
										}
									])
									.select('id')
									.single();

								if (taskError) {
									console.error(
										`Error inserting data into tasks for ${ppirInsuranceId}:`,
										taskError
									);
									showToast(`Error inserting data into tasks for ${ppirInsuranceId}:`, 'error');
									continue;
								}

								const { error: ppirFormError } = await supabase.from('ppir_forms').insert([
									{
										task_id: taskData.id,
										ppir_assignmentid: `PPIR-${row['ppir_assignmentid']}`,
										ppir_insuranceid: row['ppir_insuranceid'],
										ppir_farmername: row['ppir_farmername'],
										ppir_address: row['ppir_address'],
										ppir_farmertype: row['ppir_farmertype'],
										ppir_mobileno: row['ppir_mobileno'],
										ppir_groupname: row['ppir_groupname'],
										ppir_groupaddress: row['ppir_groupaddress'],
										ppir_lendername: row['ppir_lendername'],
										ppir_lenderaddress: row['ppir_lenderaddress'],
										ppir_cicno: row['ppir_cicno'],
										ppir_farmloc: row['ppir_farmloc'],
										ppir_north: row['ppir_north'],
										ppir_south: row['ppir_south'],
										ppir_east: row['ppir_east'],
										ppir_west: row['ppir_west'],
										ppir_att_1: row['ppir_att_1'],
										ppir_att_2: row['ppir_att_2'],
										ppir_att_3: row['ppir_att_3'],
										ppir_att_4: row['ppir_att_4'],
										ppir_area_aci: row['ppir_area_aci'],
										ppir_area_act: row['ppir_area_act'],
										ppir_dopds_aci: row['ppir_dopds_aci'],
										ppir_dopds_act: row['ppir_dopds_act'],
										ppir_doptp_aci: row['ppir_doptp_aci'],
										ppir_doptp_act: row['ppir_doptp_act'],
										ppir_svp_aci: row['ppir_svp_aci'],
										ppir_svp_act:
											row['ppir_svp_act'] == '' || !row['ppir_svp_act']
												? 'rice'
												: row['ppir_svp_act'],
										ppir_variety: row['ppir_variety'],
										ppir_stagecrop: row['ppir_stagecrop'],
										ppir_remarks: row['ppir_remarks'],
										ppir_name_insured: row['ppir_name_insured'],
										ppir_name_iuia: row['ppir_name_iuia'],
										ppir_sig_insured: row['ppir_sig_insured'],
										ppir_sig_iuia: row['ppir_sig_iuia']
									}
								]);

								if (ppirFormError) {
									showToast('Error inserting data into ppir_forms', 'error');
									console.error(
										`Error inserting data into ppir_forms for ${ppirInsuranceId}:`,
										ppirFormError
									);
									continue;
								}

								showToast(
									`Data for ${ppirInsuranceId} successfully inserted into both ppir_forms and tasks.`,
									'success'
								);
								totalSynced++;
								scannedFiles[file].rows = scannedFiles[file].rows.filter(
									(_row: any) => _row.ppir_insuranceid != row.ppir_insuranceid
								);
								scannedFiles[file].synced.push(row);
							}
						} catch (error) {
							const rowError = error as Error; // Type assertion
							console.error(`Error processing row in file ${file}:`, rowError);
							showToast(`Error processing row: ${rowError.message}`, 'error');
							totalErrors++;
						}
					}
				}
			}

			// ... rest of the function ...
		} catch (error) {
			const syncError = error as Error; // Type assertion
			console.error('Sync failed:', syncError.message);
			showToast(`Sync failed: ${syncError.message}`, 'error');
		} finally {
			isSyncing = false;
			currentlySyncing = null;
			await fetchTasks();
		}
	}

	async function handleBulkAction() {
		if (modalType === 'delete_multiple' && confirm_delete !== 'DELETE') {
			showToast("Please enter 'DELETE' to confirm task deletion!", 'error');
			return;
		}

		let successCount = 0;
		let failureCount = 0;

		for (const task of selectedTasks) {
			try {
				if (modalType === 'clear_forms') {
					await clearPPICForm(task.id);
					showToast(`Successfully cleared form of ${task.task_number}`, 'success');
					successCount++;
				} else {
					await deleteTask(task.id);
					showToast(`Successfully deleted task ${task.task_number}`, 'success');
					successCount++;
				}
			} catch (error) {
				console.error(`Error processing task ${task.task_number}:`, error);
				showToast(`Failed to process ${task.task_number}: ${error}`, 'error');
				failureCount++;
			}
		}

		const action = modalType === 'clear_forms' ? 'cleared' : 'deleted';
		if (failureCount > 0) {
			showToast(
				`Operation completed with errors. ${successCount} tasks ${action}, ${failureCount} failed.`,
				'warning'
			);
		} else {
			showToast(`Successfully ${action} ${successCount} tasks!`, 'success');
		}

		selectedTasks = [];
		confirm_delete = '';
		await fetchTasks();
	}

	type TaskTableEvent =
		| { type: 'selectTasks'; task: any }
		| { type: 'selectAllTasks' }
		| { type: 'handleSort'; column: string }
		| { type: 'generateFormView'; task: any; download: boolean }
		| { type: 'openTaskModal'; task: any }
		| { type: 'openDeleteModal'; task: any };

	function handleTaskTableEvent(event: CustomEvent<any>) {
		const eventType = event.type as TaskTableEvent['type'];
		let taskTableEvent: TaskTableEvent;

		switch (eventType) {
			case 'selectTasks':
				taskTableEvent = { type: 'selectTasks', task: event.detail };
				break;
			case 'selectAllTasks':
				taskTableEvent = { type: 'selectAllTasks' };
				break;
			case 'handleSort':
				taskTableEvent = { type: 'handleSort', column: event.detail };
				break;
			case 'generateFormView':
				taskTableEvent = { type: 'generateFormView', ...event.detail };
				break;
			case 'openTaskModal':
				taskTableEvent = { type: 'openTaskModal', task: event.detail };
				break;
			case 'openDeleteModal':
				taskTableEvent = { type: 'openDeleteModal', task: event.detail };
				break;
			default:
				console.error('Unknown event type:', eventType);
				return;
		}

		handleTaskTableEventInternal(taskTableEvent);
	}

	function handleTaskTableEventInternal(event: TaskTableEvent) {
		switch (event.type) {
			case 'selectTasks':
				selectTasks(event.task);
				break;
			case 'selectAllTasks':
				selectAllTasks();
				break;
			case 'handleSort':
				handleSort(event.column);
				break;
			case 'generateFormView':
				generateFormView(event.task, event.download);
				break;
			case 'openTaskModal':
				openTaskModal(event.task);
				break;
			case 'openDeleteModal':
				openDeleteModal(event.task);
				break;
		}
	}

	function handleSort(title: string) {
		if (!sortings.includes(title + ' Desc') && !sortings.includes(title + ' Asc')) {
			sortings.push(title + ' Desc');
		} else if (sortings.includes(title + ' Desc')) {
			sortings = sortings.filter((item) => item !== title + ' Desc');
			sortings.push(title + ' Asc');
		} else {
			sortings = sortings.filter((item) => item !== title + ' Asc');
		}
		sortFilterTasks();
	}

	function openTaskModal(task: any = null) {
		selected_task = task ? { ...task } : {};
		if (task && task.ppir_forms) {
			formView = generateFormView(selected_task);
		}
		taskModalOpen = true;
	}

	function closeTaskModal() {
		taskModalOpen = false;
		selected_task = null;
	}

	function openDeleteModal(task: any) {
		selected_task = task;
		deleteModalOpen = true;
	}

	function handleDeleteConfirm() {
		if (selected_task) {
			deleteTask(selected_task.id);
			deleteModalOpen = false;
			selected_task = null;
		}
	}

	function openModal(type: string) {
		modalType = type;
		open = true;
	}

	function openSecondaryModal(type: 'complete' | 'reset') {
		secondaryModalOpen = true;
		if (type === 'complete') {
			completeModalOpen = true;
			resetModalOpen = false;
		} else {
			completeModalOpen = false;
			resetModalOpen = true;
		}
	}
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto">
	<div class="p-8">
		<Heading tag="h1" class="mb-4 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
			Task Management
		</Heading>

		<TaskToolbar
			{statusFilter}
			{isSyncing}
			{isNational}
			{selectedTasks}
			{filterBySearch}
			{handleStatusChange}
			{openModal}
			{openTaskModal}
		/>

		{#if isLoading && spinner}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
				<img src={spinner} alt="Loading..." class="h-1/2 w-1/3" />
			</div>
		{:else}
			<TaskTable
				{isNational}
				{filteredTasks}
				{selectedTasks}
				{sortings}
				{setStatusColor}
				{setPriorityColor}
				on:selectTasks={handleTaskTableEvent}
				on:selectAllTasks={handleTaskTableEvent}
				on:handleSort={handleTaskTableEvent}
				on:generateFormView={handleTaskTableEvent}
				on:openTaskModal={handleTaskTableEvent}
				on:openDeleteModal={handleTaskTableEvent}
			/>
		{/if}
	</div>
</main>

<Task
	bind:open={taskModalOpen}
	{regions}
	{formView}
	{users}
	{markAsComplete}
	{isNational}
	bind:selected_task
	{upsertTask}
	{deleteTask}
	clearForm={clearPPICForm}
	on:close={closeTaskModal}
	{openSecondaryModal}
/>

<Modal bind:open size={modalType == 'sync' ? 'md' : 'sm'}>
	{#if modalType == 'sync'}
		<SyncModal
			{isScanning}
			{isSyncing}
			{scannedFiles}
			{currentlySyncing}
			on:syncWithFTP={syncWithFTP}
			on:scanFTP={scanFTP}
		/>
	{:else}
		<ConfirmationModal
			{modalType}
			{handleBulkAction}
			{handleConfirmDelete}
			closeModal={() => (open = false)}
		/>
	{/if}
</Modal>

<Modal bind:open={deleteModalOpen} size="sm">
	<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
		Are you sure you want to delete this task?
	</h3>
	<div class="flex justify-center gap-4">
		<Button color="red" on:click={() => handleDeleteConfirm()}>Yes, I'm sure</Button>
		<Button color="alternative" on:click={() => (deleteModalOpen = false)}>No, cancel</Button>
	</div>
</Modal>

<Modal bind:open={secondaryModalOpen} size="sm">
	{#if completeModalOpen || resetModalOpen}
		{#if completeModalOpen}
			<QuestionCircleOutline class="mx-auto mb-4 mt-8 h-10 w-10 text-blue-600" />
		{:else}
			<ExclamationCircleOutline class="mx-auto mb-4 mt-8 h-10 w-10 text-red-600" />
		{/if}

		<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
			{completeModalOpen
				? 'Are you sure you want to mark this task as completed?'
				: "Are you sure you want reset the assignee's form?"}
		</h3>

		<div class="flex items-center justify-center">
			<Button
				color={completeModalOpen ? 'blue' : 'red'}
				class="mr-2"
				on:click={async () => {
					if (completeModalOpen) {
						const success = await markAsComplete(selected_task.id);
						if (success) {
							selected_task.status = 'completed';
						}
					} else {
						await clearPPICForm(selected_task.id);
					}
					completeModalOpen = false;
					resetModalOpen = false;
				}}>Yes, I'm sure</Button
			>
			<Button
				color="alternative"
				on:click={() => {
					secondaryModalOpen = false;
					completeModalOpen = false;
					resetModalOpen = false;
				}}>No, cancel</Button
			>
		</div>
	{:else}
		<object data={formView} width="100%" height="600px" title="form"></object>
		<div class="flex items-center justify-center">
			<Button
				color="alternative"
				on:click={() => {
					completeModalOpen = false;
					resetModalOpen = false;
				}}>Close</Button
			>
		</div>
	{/if}
</Modal>

<Toast {...toastProps} />
