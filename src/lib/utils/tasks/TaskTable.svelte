<!-- src\routes\(sidebar)\crud\tasks\TaskTable.svelte -->
<script lang="ts">
	import {
		Table,
		TableHead,
		TableBody,
		TableBodyRow,
		TableBodyCell,
		TableHeadCell,
		Checkbox,
		Button,
		Input,
		Select
	} from 'flowbite-svelte';

	import {
		ArrowUpDownOutline,
		ArrowDownOutline,
		ArrowUpOutline,
		PrinterSolid,
		EditOutline,
		TrashBinSolid
	} from 'flowbite-svelte-icons';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let filteredTasks: any[];
	export let selectedTasks: any[];
	export let sortings: string[];
	export let setStatusColor: (status: string) => string;
	export let setPriorityColor: (priority: string) => string;

	// New pagination variables
	let currentPage = 1;
	let itemsPerPage = 10;
	let paginatedTasks: any[] = [];

	$: {
		paginateTasks();
	}

	function paginateTasks() {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		paginatedTasks = filteredTasks.slice(startIndex, endIndex);
	}

	function handleNextPage() {
		if (currentPage * itemsPerPage < filteredTasks.length) {
			currentPage += 1;
			paginateTasks();
		}
	}

	function handlePreviousPage() {
		if (currentPage > 1) {
			currentPage -= 1;
			paginateTasks();
		}
	}

	function selectTasks(task: any) {
		dispatch('selectTasks', task);
	}

	function selectAllTasks() {
		dispatch('selectAllTasks');
	}

	function handleSort(title: string) {
		dispatch('handleSort', title);
	}

	function generateFormView(task: any, download: boolean) {
		dispatch('generateFormView', { task, download });
	}

	function openTaskModal(task: any) {
		dispatch('openTaskModal', task);
	}

	function openDeleteModal(task: any) {
		dispatch('openDeleteModal', task);
	}
</script>

<div class="flex flex-col space-y-4">
	<div class="overflow-x-auto shadow-md sm:rounded-lg">
		<Table striped={true}>
			<TableHead>
				<TableHeadCell class="!p-4">
					<Checkbox
						on:click={selectAllTasks}
						checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
					/>
				</TableHeadCell>
				{#each ['Task Name', 'Service Group', 'Service Type', 'Attempts', 'Priority', 'Status', 'Assignee', 'Actions'] as title, index}
					<TableHeadCell>
						<div class="flex items-center justify-between">
							{title}
							{#if ['Task Name', 'Service Type', 'Priority'].includes(title)}
								<button on:click={() => handleSort(title)} class="ml-1">
									{#if !sortings.includes(title + ' Desc') && !sortings.includes(title + ' Asc')}
										<ArrowUpDownOutline size="xs" />
									{:else if sortings.includes(title + ' Desc')}
										<ArrowDownOutline size="xs" />
									{:else}
										<ArrowUpOutline size="xs" />
									{/if}
								</button>
							{/if}
						</div>
					</TableHeadCell>
				{/each}
			</TableHead>
			<TableBody>
				{#if paginatedTasks.length === 0}
					<TableBodyRow>
						<TableBodyCell colspan="9" class="py-4 text-center">
							<img
								src=""
								alt="No tasks available"
								class="mx-auto mb-2"
								style="inline-size: 100px; block-size: auto;"
							/>
							<p class="text-gray-500 dark:text-gray-400">No tasks available</p>
						</TableBodyCell>
					</TableBodyRow>
				{:else}
					{#each paginatedTasks as task}
						<TableBodyRow>
							<TableBodyCell class="!p-4">
								<Checkbox
									on:click={() => selectTasks(task)}
									checked={selectedTasks.includes(task)}
								/>
							</TableBodyCell>
							<TableBodyCell>
								{#if task.status === 'completed'}
									<button
										on:click={() => generateFormView(task, true)}
										class="font-medium text-blue-600 hover:underline dark:text-blue-500"
									>
										<PrinterSolid class="mr-1 inline" size="xs" />
										{task.task_number || 'NOT SET'}
									</button>
								{:else}
									{task.task_number || 'NOT SET'}
								{/if}
								<p class="text-xs text-gray-500 dark:text-gray-400">{task.task_type ?? 'ppir'}</p>
							</TableBodyCell>
							<TableBodyCell>{task.service_group}</TableBodyCell>
							<TableBodyCell>{task.service_type}</TableBodyCell>
							<TableBodyCell>{task.attempt_count}</TableBodyCell>
							<TableBodyCell>
								<span class="font-medium {setPriorityColor(task.priority)}"
									>{task.priority.toUpperCase()}</span
								>
							</TableBodyCell>
							<TableBodyCell>
								<span class="font-medium {setStatusColor(task.status)}"
									>{task.status.toUpperCase()}</span
								>
							</TableBodyCell>
							<TableBodyCell>
								<div class="text-sm">
									<p class="font-medium">{task.users.inspector_name.toUpperCase()}</p>
									<p class="text-gray-500 dark:text-gray-400">{task.users.email.toLowerCase()}</p>
								</div>
							</TableBodyCell>
							<TableBodyCell>
								<div class="flex items-center space-x-2">
									<Button size="xs" on:click={() => openTaskModal(task)}>
										<EditOutline size="xs" class="mr-1" /> Manage
									</Button>
									<Button color="red" size="xs" on:click={() => openDeleteModal(task)}>
										<TrashBinSolid size="xs" class="mr-1" /> Delete
									</Button>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>
	<div class="mt-4 flex items-center justify-between">
		<Button color="blue" on:click={handlePreviousPage} disabled={currentPage === 1}>
			Previous
		</Button>
		<span class="text-gray-400"
			>Page {currentPage} of {Math.ceil(filteredTasks.length / itemsPerPage)}</span
		>
		<Button
			color="blue"
			on:click={handleNextPage}
			disabled={currentPage * itemsPerPage >= filteredTasks.length}
		>
			Next
		</Button>
	</div>
</div>
