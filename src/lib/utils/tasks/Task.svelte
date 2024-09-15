<script lang="ts">
	import {
		Button,
		CloseButton,
		Heading,
		Input,
		Label,
		Modal,
		Select,
		Textarea
	} from 'flowbite-svelte';
	import {
		CloseOutline,
		ExclamationCircleOutline,
		QuestionCircleOutline
	} from 'flowbite-svelte-icons';
	import { onMount, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let open: boolean = false;
	export let users: any[] = [];
	export let selected_task: any = {};
	export let upsertTask: any = null;
	export let formView: any;
	export let regions: any[] = [];
	export let openSecondaryModal: (type: 'complete' | 'reset') => void;
	export let markAsComplete: (taskId: string) => Promise<boolean>;
	export let clearForm: (taskId: string) => Promise<void>;
	export let deleteTask: (id: string) => Promise<void>;

	let filteredUsers: any[] = [...users];
	let task_name: string;
	let service_group: string;
	let priority: string;
	let status: string = 'for dispatch';
	let ppir_form: any = {};

	let searchModalOpen = false;

	let completeWarning: boolean = true;
	let viewForm = false;
	let completeModalOpen = false;
	let resetModalOpen = false;

	let ppir_form_initial_columns = [
		'ppir_assignmentid',
		'ppir_insuranceid',
		'ppir_farmername',
		'ppir_address',
		'ppir_farmertype',
		'ppir_mobileno',
		'ppir_groupname',
		'ppir_groupaddress',
		'ppir_lendername',
		'ppir_lenderaddress',
		'ppir_cicno',
		'ppir_farmloc',
		'ppir_north',
		'ppir_south',
		'ppir_east',
		'ppir_west',
		'ppir_area_aci',
		'ppir_dopds_aci',
		'ppir_doptp_aci',
		'ppir_svp_aci'
	];

	const ppir_form_fields = [
		'ppir_svp_act',
		'ppir_variety',
		'ppir_stagecrop',
		'ppir_remarks',
		'ppir_name_insured',
		'ppir_name_iuia',
		'ppir_sig_insured',
		'ppir_sig_iuia',
		'ppir_att_1',
		'ppir_att_2',
		'ppir_att_3',
		'ppir_att_4'
	];

	onMount(() => {
		console.log(formView);
	});

	$: ({ markAsComplete, clearForm, deleteTask });

	$: if (selected_task) {
		selected_user = users.find((user) => user.id == selected_task.users?.id) || null;
		task_name = selected_task.task_number || '';
		service_group = selected_task.service_group || '';
		status = selected_task.status || 'for dispatch';
		priority = selected_task.priority || '';
		ppir_form = selected_task.ppir_forms || {};
	}

	let editPPIRFormOpen = false;

	const openEditPPIRForm = () => {
		editPPIRFormOpen = true;
	};

	const savePPIRForm = () => {
		editPPIRFormOpen = false;
	};

	const handleNullValue = (value: any) => {
		return value === null || value === undefined || value === '' ? null : value;
	};

	let selected_user: any = null;

	const filterUsers = (event: Event) => {
		const query = (event.target as HTMLInputElement).value.toLowerCase();
		filteredUsers = users.filter((user) => user.inspector_name.toLowerCase().includes(query));
	};
	const handleUserSelect = (user: any) => {
		selected_user = user;
		searchModalOpen = false;
	};
	const handleUserChange = (event: Event) => {
		const select = event.target as HTMLSelectElement;
		selected_user = users.find((user) => user.id === select.value) || null;
	};
	const handlePOChange = (event: any) => {
		service_group = event.target.value;
	};
	const handlePrioChange = (event: any) => {
		priority = event.target.value;
	};

	const handleTaskNameChange = (event: any) => {
		task_name = event.target.value;
	};

	const getPOFromIndex = (index: number) => {
		switch (index) {
			case 4:
				return 'PO4A';
			case 5:
				return 'PO4B';
			default:
				if (index < 4) {
					return 'PO' + index;
				} else {
					return 'PO' + (index - 1);
				}
		}
	};

	const getRegionFromPO = (index: number) => {
		switch (index) {
			case 4:
				return '04A';
			case 5:
				return '04B';
			default:
				if (index < 4) {
					return index;
				} else {
					return index - 1;
				}
		}
	};

	const getTypeFromPO = (PO: string) => {
		return `${regions.find((region) => region.region_code == PO).region_name} PPIR`;
	};

	function isFormValid() {
		return task_name && service_group && priority && selected_user;
	}

	async function handleSubmit() {
		if (!isFormValid()) {
			// Show an error message or handle invalid form
			return;
		}
		try {
			const success = await upsertTask(
				{
					id: selected_task?.id,
					task_number: task_name,
					service_group: service_group,
					service_type: getTypeFromPO(service_group),
					priority: priority,
					assignee: selected_user ? selected_user.id : null,
					status: status,
					task_type: 'ppir'
				},
				ppir_form
			);
			if (success) {
				dispatch('close');
			}
		} catch (error) {
			console.error('Error upserting task:', error);
		}
	}
</script>

<Modal bind:open size="xl">
	<Heading tag="h1" class="mb-6 text-lg font-semibold uppercase">
		{selected_task && selected_task.id ? 'Update Task' : 'Add New Task'}
	</Heading>
	<form on:submit|preventDefault={handleSubmit}>
		<div class="space-y-4">
			<Label class="space-y-2">
				<span>Name</span>
				<Input
					name="title"
					class="border font-normal outline-none"
					placeholder="Type task name"
					value={task_name}
					on:change={handleTaskNameChange}
					required
				/>
			</Label>

			<Label class="space-y-2">
				<span>Service Group</span>
				<Select
					disabled={regions.length == 1}
					class="border-gray-300 font-normal outline-none"
					bind:value={service_group}
					required
				>
					<option value={null} selected>Select Type</option>
					{#if regions.length == 1}
						{#each regions as region}
							<option selected value={region.region_code}>{region.region_code}</option>
						{/each}
					{:else}
						{#each regions as region}
							{#if service_group == region.region_code}
								<option selected value={region.region_code}>{region.region_code}</option>
							{:else}
								<option value={region.region_code}>{region.region_code}</option>
							{/if}
						{/each}
					{/if}
				</Select>
			</Label>

			<Label class="space-y-2">
				<span>Service Type</span>
				<Input
					name="group"
					class="border font-normal outline-none"
					readonly
					placeholder="None"
					value={service_group ? getTypeFromPO(service_group) : ''}
					required
				/>
			</Label>
			<Label class="space-y-2">
				<span>Priority</span>
				<Select
					class="border-gray-300 font-normal outline-none"
					on:change={handlePrioChange}
					required
				>
					<option value={null} selected>Set Priority</option>
					{#each ['Low', 'Medium', 'High'] as prio}
						{#if priority == prio}
							<option selected value={prio}>{prio}</option>
						{:else}
							<option value={prio}>{prio}</option>
						{/if}
					{/each}
				</Select>
			</Label>

			<Label class="space-y-2">
				<span>Assignee</span>
				<div class="flex space-x-2">
					<Select
						name="assignee"
						class="flex-grow border font-normal outline-none"
						bind:value={selected_user}
						required
					>
						<option value={null}>Select an assignee</option>
						{#each users as user}
							<option value={user}>{user.inspector_name}</option>
						{/each}
					</Select>
					<Button on:click={() => (searchModalOpen = true)}>Search</Button>
				</div>
			</Label>

			{#each ppir_form_initial_columns as ppir_col}
				<Label class="space-y-2">
					<span>{ppir_col.replaceAll('_', ' ')}</span>
					<Input
						name="title"
						class="border font-normal outline-none"
						placeholder="Type {ppir_col.replaceAll('_', ' ')}"
						bind:value={ppir_form[ppir_col]}
					/>
				</Label>
			{/each}

			{#if selected_task}
				<Label class="space-y-2">
					<span>PPIR Form</span>
					<Button
						color="green"
						on:click={() => {
							open = true;
							viewForm = true;
						}}
						class="mb-2 w-full">View Form</Button
					>
					<Button color="blue" on:click={openEditPPIRForm} class="mb-2 w-full"
						>Edit PPIR Form</Button
					>
					<Button on:click={() => openSecondaryModal('reset')} color="red" class="mb-2 w-full">
						Clear Form
					</Button>
				</Label>

				<!-- {#if selected_task.status != 'completed'} -->
				<Label class="space-y-2">
					<span>Status</span>
					<Button
						on:click={() => {
							if (selected_task.status !== 'completed') {
								openSecondaryModal('complete');
							}
						}}
						color={selected_task.status === 'completed' ? 'green' : 'blue'}
						class="mb-2 w-full"
					>
						{selected_task.status === 'completed' ? 'Completed' : 'Mark as Complete'}
					</Button>
				</Label>
			{/if}

			<div class="flex w-full justify-center space-x-4 pb-4">
				<Button
					on:click={async () => {
						if (task_name.trim() === '') {
							// Show an error message or handle empty task name
							return;
						}
						const success = await upsertTask(
							{
								id: selected_task?.id,
								task_number: task_name,
								service_group: service_group,
								service_type: getTypeFromPO(service_group),
								priority: priority,
								assignee: selected_user ? selected_user.id : null,
								status: status,
								task_type: 'ppir'
							},
							ppir_form
						);

						if (success) {
							dispatch('close');
						}
					}}
					type="submit"
					class="w-full"
				>
					{selected_task?.id ? 'Update Task' : 'Add Task'}
				</Button>
				<Button color="alternative" class="w-full" on:click={() => dispatch('close')}>
					<CloseOutline />
					Cancel
				</Button>
			</div>
		</div>
	</form>
</Modal>

<!-- <Modal bind:open={completeModalOpen || resetModalOpen} size="sm">
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
						clearForm(selected_task.id);
					}
					completeModalOpen = false;
					resetModalOpen = false;
				}}>Yes, I'm sure</Button
			>
			<Button
				color="alternative"
				on:click={() => {
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
</Modal> -->

<Modal bind:open={searchModalOpen} size="md">
	<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Search Users</h3>
	<Input
		name="userSearch"
		class="mb-4 border font-normal outline-none"
		placeholder="Search users..."
		on:input={filterUsers}
	/>
	<div class="h-48 w-full overflow-y-scroll rounded-lg bg-black/[0.05] p-2">
		{#each filteredUsers as user}
			<Button on:click={() => handleUserSelect(user)} class="mb-2 w-full"
				>{user.inspector_name}</Button
			>
		{/each}
	</div>
</Modal>

<!-- Add this new Modal for editing PPIR form -->
<Modal bind:open={editPPIRFormOpen} size="xl">
	<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Edit PPIR Form</h3>
	<form on:submit|preventDefault={savePPIRForm} class="max-h-[70vh] space-y-4 overflow-y-auto">
		{#each ppir_form_fields as field}
			<Label class="block">
				<span class="text-gray-700">{field.replaceAll('_', ' ').toUpperCase()}</span>
				{#if field === 'ppir_remarks'}
					<Textarea
						name={field}
						bind:value={ppir_form[field]}
						placeholder={field.replaceAll('_', ' ')}
						class="mt-1 w-full"
						rows="3"
					/>
				{:else if field.startsWith('ppir_sig_')}
					<p class="text-sm text-gray-500">Signature cannot be edited here</p>
				{:else if field.startsWith('ppir_att_')}
					<p class="text-sm text-gray-500">Attachment cannot be edited here</p>
				{:else}
					<Input
						type="text"
						name={field}
						bind:value={ppir_form[field]}
						placeholder={field.replaceAll('_', ' ')}
						class="mt-1 w-full"
					/>
				{/if}
			</Label>
		{/each}
		<div class="mt-4 flex justify-end space-x-2">
			<Button type="submit">Save Changes</Button>
			<Button color="alternative" on:click={() => (editPPIRFormOpen = false)}>Cancel</Button>
		</div>
	</form>
</Modal>

{#if selected_task && selected_task.ppir_forms}
	<p>{handleNullValue(selected_task.ppir_forms.ppir_assignmentid)}</p>
{/if}
