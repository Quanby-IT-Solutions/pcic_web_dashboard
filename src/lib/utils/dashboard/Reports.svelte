<script lang="ts">
	import spinner from '$lib/assets/pcic-spinner.gif';
	import jsPDF from 'jspdf';
	import autoTable from 'jspdf-autotable';
	import * as XLSX from 'xlsx';
	import TaskTimeline from './TaskTimeline.svelte';

	import { FilePdfOutline, TableColumnOutline } from 'flowbite-svelte-icons';

	import { onMount } from 'svelte';

	import { AdjustmentsHorizontalSolid } from 'flowbite-svelte-icons';

	import {
		Button,
		Checkbox,
		Heading,
		Modal,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';

	import {
		initializeTaskFilteredData,
		taskActiveHeaders,
		taskAllHeaders,
		taskSelectedHeaders
	} from '$lib/utils/_data/taskStore';

	import { browser } from '$app/environment';
	import {
		initializeRegionFilteredData,
		regionActiveHeaders,
		regionAllHeaders,
		regionSelectedHeaders
	} from '$lib/utils/_data/regionStore';
	import RegionTable from '../report-generation/components/RegionTable.svelte';
	import TaskTable from '../report-generation/components/TaskTable.svelte';

	let showActivity = false;
	let selectedUserId: string | null = null;
	let inspectors: any[] = [];
	let isLoading = true;
	let dataError: string | null = null;
	let showPagination = true;

	let selectedWeek: number;
	let selectedMonth: number;
	let selectedDay: number;


	let monthOptions = Array.from({ length: 12 }, (_, i) => i);
	let dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
	let weekOptions: any[] = [];

	let showColumnModal = false;
	let userActiveHeaders = [
		'Inspector Name',
		'Mobile Number',
		'Online',
		'Mon',
		'Tue',
		'Wed',
		'Thu',
		'Fri',
		'Sat',
		'Sun',
		'Total Dispatch',
		'Total Completed',
		'Backlogs'
	];

	export let data;
	$: ({ supabase } = data);

	let selectedTable: string = 'users';

	let userSelectedHeaders = [...userActiveHeaders];

	function initializeDateToToday() {
		const today = new Date();
		selectedMonth = today.getMonth();
		selectedDay = today.getDate();
		selectedWeek = getCurrentWeekNumber(today);
		}

		function getCurrentWeekNumber(date: Date) {
		const start = new Date(date.getFullYear(), date.getMonth(), 1);
		const diff =
			date.getTime() -
			start.getTime() +
			(start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000;
		const oneWeek = 604800000;
		return Math.floor(diff / oneWeek) + 1;
		}

		function getStartAndEndOfWeek(week: number, month: number, year: number) {
		const start = new Date(year, month, (week - 1) * 7 + 1);
		const end = new Date(year, month, (week - 1) * 7 + 7);
		end.setHours(23, 59, 59, 999);
		return { start, end };
		}

		function updateWeekOptions() {
		const selectedDate = new Date(new Date().getFullYear(), selectedMonth, selectedDay);
		selectedWeek = getCurrentWeekNumber(selectedDate);
		const totalWeeksInMonth = getCurrentWeekNumber(
			new Date(new Date().getFullYear(), selectedMonth + 1, 0)
		);
		weekOptions = Array.from({ length: totalWeeksInMonth }, (_, i) => i + 1);
		}


	async function fetchInspectors(startDate: Date, endDate: Date) {
		isLoading = true;
		try {
			const [usersResponse, tasksResponse] = await Promise.all([
			supabase
				.from('users')
				.select(`
				id, 
				inspector_name, 
				mobile_number, 
				is_online, 
				email,
				regions (
					region_name
				)
				`)
				.eq('role', 'Agent'),
			supabase
				.from('tasks')
				.select('id, assignee, status, created_at')
				.gte('created_at', startDate.toISOString())
				.lte('created_at', endDate.toISOString())
			]);

			if (usersResponse.error) throw new Error(usersResponse.error.message);
			if (tasksResponse.error) throw new Error(tasksResponse.error.message);

			const users = usersResponse.data;
			const tasks = tasksResponse.data;

			const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

			inspectors = users.map((user: { id: any; inspector_name: any; mobile_number: any; is_online: any; email: any; regions: { region_name: any; }; }) => {
			const userTasks = tasks.filter((task: { assignee: any; }) => task.assignee === user.id);
			const totalDispatch = userTasks.length;
			const completed = userTasks.filter((task: { status: string; }) => task.status === 'completed').length;
			const backlogs = userTasks.filter((task: { status: string; }) => task.status === 'ongoing').length;

			const tasksByDay = weekDays.map((day, index) => {
				const dayStart = new Date(startDate);
				dayStart.setDate(startDate.getDate() + index);
				const dayEnd = new Date(dayStart);
				dayEnd.setHours(23, 59, 59, 999);

				return userTasks.filter((task: { created_at: string | number | Date; status: string; }) => {
				const taskDate = new Date(task.created_at);
				return taskDate >= dayStart && taskDate <= dayEnd && task.status === 'completed';
				}).length;
			});

			return {
				id: user.id,
				name: user.inspector_name,
				mobile: user.mobile_number,
				online: user.is_online,
				...Object.fromEntries(weekDays.map((day, index) => [day, tasksByDay[index]])),
				totalDispatch,
				completed,
				backlogs,
				email: user.email,
				region: user.regions?.region_name ?? 'N/A'
			};
			});
		} catch (error) {
			dataError = (error as Error).message;
			console.error('Error:', error);
		} finally {
			isLoading = false;
		}
		}


	function handleRowClick(userId: string) {
		selectedUserId = userId;
		showActivity = true;
		showPagination = false;
	}

	function goBack() {
		showActivity = false;
		selectedUserId = null;
	}

	function handleMonthChange(event: Event) {
		selectedMonth = parseInt((event.target as HTMLSelectElement).value);
		updateWeekOptions();
		const { start: startOfWeek, end: endOfWeek } = getStartAndEndOfWeek(
			selectedWeek,
			selectedMonth,
			new Date().getFullYear()
		);
		fetchInspectors(startOfWeek, endOfWeek);
		}

	function handleDayChange(event: Event) {
		selectedDay = parseInt((event.target as HTMLSelectElement).value);
		updateWeekOptions();
		const { start: startOfWeek, end: endOfWeek } = getStartAndEndOfWeek(
			selectedWeek,
			selectedMonth,
			new Date().getFullYear()
		);
		fetchInspectors(startOfWeek, endOfWeek);
		}

	function handleWeekChange(event: Event) {
		selectedWeek = parseInt((event.target as HTMLSelectElement).value);
		const { start: startOfWeek, end: endOfWeek } = getStartAndEndOfWeek(
			selectedWeek,
			selectedMonth,
			new Date().getFullYear()
		);
		selectedDay = startOfWeek.getDate();
		fetchInspectors(startOfWeek, endOfWeek);
		}

	function toggleHeader(header: string) {
		if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(header)) {
			if (userSelectedHeaders.includes(header)) {
				userSelectedHeaders = userSelectedHeaders.filter((h) => h !== header);
				if (
					!['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].some((day) =>
						userSelectedHeaders.includes(day)
					)
				) {
					userSelectedHeaders = userSelectedHeaders.filter(
						(h) => !['Total Dispatch', 'Total Completed', 'Backlogs'].includes(h)
					);
				}
			} else {
				userSelectedHeaders = [...userSelectedHeaders, header];
			}
		} else if (['Total Dispatch', 'Total Completed', 'Backlogs'].includes(header)) {
			if (userSelectedHeaders.includes(header)) {
				userSelectedHeaders = userSelectedHeaders.filter((h) => h !== header);
			} else if (
				['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].some((day) =>
					userSelectedHeaders.includes(day)
				)
			) {
				userSelectedHeaders = [...userSelectedHeaders, header];
			}
		} else {
			if (userSelectedHeaders.includes(header)) {
				userSelectedHeaders = userSelectedHeaders.filter((h) => h !== header);
			} else {
				userSelectedHeaders = [...userSelectedHeaders, header];
			}
		}
	}

	$: isDaySelected = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].some((day) =>
		userSelectedHeaders.includes(day)
	);

	const updateColumns = () => {
		if (selectedTable == 'tasks') {
			$taskActiveHeaders = [...$taskSelectedHeaders];
			showColumnModal = false;
		} else if (selectedTable == 'regions') {
			$regionActiveHeaders = [...$regionSelectedHeaders];
			showColumnModal = false;
		} else {
			userActiveHeaders = [...userSelectedHeaders];
			showColumnModal = false;
		}
	};

	const mapInspectorData = (inspector: any, headers: string[]) => {
		const mappedData = headers.reduce(
			(acc, header) => {
				switch (header) {
					case 'Inspector Name':
						acc[header] = inspector.name ?? 'N/A';
						break;
					case 'Mobile Number':
						acc[header] = inspector.mobile ?? 'N/A';
						break;
					case 'Online':
						acc[header] = inspector.online ? 'Online' : 'Offline';
						break;
					case 'Mon':
						acc[header] = inspector.Mon ?? 0;
						break;
					case 'Tue':
						acc[header] = inspector.Tue ?? 0;
						break;
					case 'Wed':
						acc[header] = inspector.Wed ?? 0;
						break;
					case 'Thu':
						acc[header] = inspector.Thu ?? 0;
						break;
					case 'Fri':
						acc[header] = inspector.Fri ?? 0;
						break;
					case 'Sat':
						acc[header] = inspector.Sat ?? 0;
						break;
					case 'Sun':
						acc[header] = inspector.Sun ?? 0;
						break;
					case 'Total Dispatch':
						acc[header] = inspector.totalDispatch ?? 0;
						break;
					case 'Total Completed':
						acc[header] = inspector.completed ?? 0;
						break;
					case 'Backlogs':
						acc[header] = inspector.backlogs ?? 0;
						break;
					case 'Email':
						acc[header] = inspector.email ?? 'N/A';
						break;
					case 'Region':
						acc[header] = inspector.region ?? 'N/A';
						break;
					default:
						acc[header] = 'N/A';
				}
				return acc;
			},
			{} as { [key: string]: any }
		);

		return mappedData;
	};

	function getTodayDate() {
		const today = new Date();
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
	}

	const generatePDF = () => {
		if (!isDaySelected) {
			return;
		}

		const doc = new jsPDF({
			orientation: 'landscape',
			unit: 'pt',
			format: 'A4'
		});

		const headers = userActiveHeaders;
		const body = inspectors.map((inspector) =>
			headers.map((header) => mapInspectorData(inspector, headers)[header])
		);

		doc.setFontSize(18);
		doc.text('Inspectors Weekly Tasks', doc.internal.pageSize.width / 2, 25, {
			align: 'center'
		});

		autoTable(doc, {
			head: [headers],
			body,
			startY: 45,
			theme: 'grid',
			headStyles: {
				fillColor: [41, 128, 185],
				textColor: [255, 255, 255],
				fontSize: 10,
				halign: 'center'
			},
			bodyStyles: {
				fontSize: 8,
				halign: 'center'
			},
			columnStyles: {
				0: { cellWidth: 'auto' },
				1: { cellWidth: 'auto' }
			},
			styles: {
				overflow: 'linebreak',
				cellWidth: 'wrap'
			},
			margin: { top: 20 },
			didParseCell: function (data) {
				if (data.section === 'body' && data.column.index === 1) {
					data.cell.styles.cellWidth = 'wrap';
				}
			},
			tableWidth: 'auto'
		});

		const dayToday = getTodayDate();
		doc.save(`inspectors_report_${dayToday}.pdf`);
	};

	const generateExcel = () => {
		if (!isDaySelected) {
			return;
		}

		const headers = userActiveHeaders;
		const body = inspectors.map((inspector) => mapInspectorData(inspector, headers));

		const worksheet = XLSX.utils.json_to_sheet(body, { header: headers });

		const columnWidths = headers.map((header) => ({ wch: Math.max(header.length, 15) }));
		worksheet['!cols'] = columnWidths;

		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Inspectors Weekly Tasks');

		const dayToday = getTodayDate();
		XLSX.writeFile(workbook, `inspectors_report_${dayToday}.xlsx`);
	};

			onMount(() => {
		if (browser) {
			initializeDateToToday();
			const { start: startOfWeek, end: endOfWeek } = getStartAndEndOfWeek(
			selectedWeek,
			selectedMonth,
			new Date().getFullYear()
			);
			fetchInspectors(startOfWeek, endOfWeek);
			updateWeekOptions();
		}
		});

	const headers = [
		'Mobile Number',
		'Online',
		'Mon',
		'Tue',
		'Wed',
		'Thu',
		'Fri',
		'Sat',
		'Sun',
		'Total Dispatch',
		'Total Completed',
		'Backlogs',
		'Email',
		'Region'
	];

	const handleTableChange = async () => {
		if (selectedTable == 'tasks') {
			isLoading = true;
			const { data: taskData, error: taskError } = await supabase.rpc('get_task_data');
			initializeTaskFilteredData(taskData ?? []);
			isLoading = false;
		}
		if (selectedTable == 'regions') {
			isLoading = true;
			const { data: regionData, error: regionError } = await supabase.rpc('get_region_summary');
			initializeRegionFilteredData(regionData ?? []);
			isLoading = false;
		}
	};

	$: if (inspectors.length > 0) {
		paginateInspectors();
	}

	let currentPage = 1;
	let itemsPerPage = 10;
	let paginatedInspectors: any[] = [];

	function paginateInspectors() {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		paginatedInspectors = inspectors.slice(startIndex, endIndex);
	}

	function handleNextPage() {
		if (currentPage * itemsPerPage < inspectors.length) {
			currentPage += 1;
			paginateInspectors();
		}
	}

	function handlePreviousPage() {
		if (currentPage > 1) {
			currentPage -= 1;
			paginateInspectors();
		}
	}

	$: paginateInspectors();
</script>

<main class="relative flex min-h-screen flex-col">
	{#if showActivity && selectedUserId}
    <TaskTimeline 
      userId={selectedUserId} 
      selectedMonth={selectedMonth} 
      selectedDay={selectedDay} 
      selectedWeek={selectedWeek} 
      on:back={goBack} 
    />
	{:else}
		<div class="flex-grow p-4">
			<div class="mb-4 flex items-center justify-between">
				<Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
					Inspectors Weekly Tasks
				</Heading>

				<div class="flex items-center gap-2">
					<span class="text-right text-sm text-gray-700 dark:text-gray-300">Current:</span>
					<Select
						on:change={handleTableChange}
						bind:value={selectedTable}
						class="w-48 max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
						placeholder=""
					>
						<option value="users">User Task Summary</option>
						<option value="tasks">Task Report</option>
						<option value="regions">Regions Summary</option>
					</Select>
				</div>
			</div>

			{#if selectedTable === 'users'}
				<div class="mb-4 flex items-center gap-6">
					<div class="flex items-center">
						<label for="monthSelect" class="mr-2 text-sm text-gray-700 dark:text-gray-300"
							>Month:</label
						>
						<select
							id="monthSelect"
							on:change={handleMonthChange}
							bind:value={selectedMonth}
							class="w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
						>
							{#each monthOptions as month}
								<option value={month} selected={month === selectedMonth}>
									{new Date(0, month).toLocaleString('default', { month: 'long' })}
								</option>
							{/each}
						</select>
					</div>
					<div class="flex items-center">
						<label for="daySelect" class="mr-2 text-sm text-gray-700 dark:text-gray-300">Day:</label
						>
						<select
							id="daySelect"
							on:change={handleDayChange}
							bind:value={selectedDay}
							class="w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
						>
							{#each dayOptions as day}
								<option value={day} selected={day === selectedDay}>{day}</option>
							{/each}
						</select>
					</div>
					<div class="flex items-center">
						<label for="weekSelect" class="mr-2 text-sm text-gray-700 dark:text-gray-300"
							>Week:</label
						>
						<select
							id="weekSelect"
							on:change={handleWeekChange}
							bind:value={selectedWeek}
							class="w-28 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
						>
							{#each weekOptions as week}
								<option value={week} selected={week === selectedWeek}>Week {week}</option>
							{/each}
						</select>
					</div>
				</div>
			{/if}
			{#if selectedTable === 'users'}
				<div class="mb-4 flex justify-end space-x-4">
					<Button
						on:click={() => (showColumnModal = true)}
						color="blue"
						size="xs"
						class="flex items-center gap-2"
					>
						<AdjustmentsHorizontalSolid /> Customize Columns
					</Button>
					<Button
						class="flex items-center gap-2 text-xs"
						color="red"
						size="xs"
						on:click={generatePDF}
						disabled={!isDaySelected}
					>
						<FilePdfOutline /> Download PDF
					</Button>
					<Button
						class="flex items-center gap-2 text-xs"
						color="green"
						size="xs"
						on:click={generateExcel}
						disabled={!isDaySelected}
					>
						<TableColumnOutline /> Download Excel
					</Button>
				</div>
			{/if}

			{#if dataError}
				<p class="text-red-500">{dataError}</p>
			{:else if isLoading}
				<div
					class="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
				>
					<img src={spinner} alt="Loading..." class="h-1/2 w-1/3 object-contain" />
				</div>
			{:else if selectedTable === 'tasks'}
				<TaskTable />
			{:else if selectedTable === 'users'}
				<Table hoverable={true}>
					<TableHead class="border-b border-gray-300 bg-gray-50 dark:border-gray-700">
						{#each userActiveHeaders as header}
							<TableHeadCell
								class="whitespace-nowrap px-6 py-3 {header === 'Inspector Name' ||
								header === 'Mobile Number'
									? 'text-left'
									: 'text-center'} font-medium text-gray-900 dark:text-white"
							>
								{header}
							</TableHeadCell>
						{/each}
					</TableHead>
					<TableBody>
						{#if paginatedInspectors.length > 0}
							{#each paginatedInspectors as inspector}
								<TableBodyRow
									on:click={() => handleRowClick(inspector.id)}
									class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									{#each userActiveHeaders as header}
										<TableBodyCell
											class="px-6 py-4 {header === 'Inspector Name' || header === 'Mobile Number'
												? 'text-left'
												: 'text-center'} text-base text-gray-900 dark:text-gray-300"
										>
											{#if header === 'Online'}
												<span class="flex items-center justify-center">
													<span
														class={`h-3 w-3 rounded-full ${
															inspector.online ? 'bg-green-500' : 'bg-gray-500'
														} mr-2`}
													></span>
													<span
														class={`text-sm font-semibold ${
															inspector.online ? 'text-green-600' : 'text-gray-500'
														}`}
													>
														{inspector.online ? 'Online' : 'Offline'}
													</span>
												</span>
											{:else}
												{mapInspectorData(inspector, userActiveHeaders)[header]}
											{/if}
										</TableBodyCell>
									{/each}
								</TableBodyRow>
							{/each}
						{:else}
							<TableBodyRow>
								<TableBodyCell
									colspan={userActiveHeaders.length}
									class="text-center text-base text-gray-500 dark:text-gray-400"
								>
									No inspectors found.
								</TableBodyCell>
							</TableBodyRow>
						{/if}
					</TableBody>
				</Table>
			{:else if selectedTable === 'regions'}
				<RegionTable />
			{/if}
		</div>
	{/if}

	{#if selectedTable === 'users' && showPagination}
		<div class="mx-4 mt-auto flex items-center justify-between p-4">
			<Button color="blue" on:click={handlePreviousPage} disabled={currentPage === 1}>
				Previous
			</Button>
			<span class="text-gray-400"
				>Page {currentPage} of {Math.ceil(inspectors.length / itemsPerPage)}</span
			>
			<Button
				color="blue"
				on:click={handleNextPage}
				disabled={currentPage * itemsPerPage >= inspectors.length}
			>
				Next
			</Button>
		</div>
	{/if}
</main>

<Modal bind:open={showColumnModal} size="lg" autoclose={false}>
	<div class="py-4">
		<h2 class="mb-4 text-2xl font-bold text-gray-500 dark:text-gray-400">Customize Columns</h2>

		<div class="grid grid-cols-3 gap-4">
			{#if selectedTable == 'tasks'}
				{#each $taskAllHeaders as header}
					<Checkbox
						checked={$taskSelectedHeaders.includes(header)}
						on:change={() => toggleHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{:else if selectedTable == 'regions'}
				{#each $regionAllHeaders as header}
					<Checkbox
						checked={$regionSelectedHeaders.includes(header)}
						on:change={() => toggleHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{:else}
				<div>
					<h2>Personal Data</h2>
					<Checkbox
						checked={userSelectedHeaders.includes('Mobile Number')}
						on:change={() => toggleHeader('Mobile Number')}
					>
						Mobile Number
					</Checkbox>
					<Checkbox
						checked={userSelectedHeaders.includes('Region')}
						on:change={() => toggleHeader('Region')}
					>
						Region
					</Checkbox>
					<Checkbox
						checked={userSelectedHeaders.includes('Email')}
						on:change={() => toggleHeader('Email')}
					>
						Email
					</Checkbox>
					<Checkbox
						checked={userSelectedHeaders.includes('Online')}
						on:change={() => toggleHeader('Online')}
					>
						Online
					</Checkbox>
				</div>
				<div>
					<h2>Days</h2>

					{#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}
						<Checkbox
							checked={userSelectedHeaders.includes(day)}
							on:change={() => toggleHeader(day)}
						>
							{day}
						</Checkbox>
					{/each}
				</div>
				<div>
					<h2>Tasks Data</h2>

					{#each ['Total Dispatch', 'Total Completed', 'Backlogs'] as header}
						<Checkbox
							checked={userSelectedHeaders.includes(header)}
							on:change={() => toggleHeader(header)}
							disabled={!['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].some((day) =>
								userSelectedHeaders.includes(day)
							)}
						>
							{header}
						</Checkbox>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex justify-end">
			<Button class="mt-4" size="xs" color="blue" on:click={updateColumns}>Update Columns</Button>
		</div>
	</div>
</Modal>
