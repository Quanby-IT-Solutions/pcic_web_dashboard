<script lang="ts">
	import { Button, Input, Toolbar } from 'flowbite-svelte';
	import {
		ArrowsRepeatOutline,
		ReplySolid,
		TrashBinSolid,
		PlusOutline
	} from 'flowbite-svelte-icons';
	export let statusFilter: string;
	export let isSyncing: boolean;
	export let isNational: boolean = false;
	export let selectedTasks: any[];
	export let filterBySearch: (event: any) => void;
	export let handleStatusChange: (status: string) => void;
	export let openModal: (type: string) => void;
	export let openTaskModal: (task?: any) => void;
</script>

<Toolbar embedded class="w-full py-4 text-gray-500 dark:text-gray-400">
	<!-- Search Input -->
	<Input
		on:keyup={filterBySearch}
		placeholder="Search for task"
		class="me-6 w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
	/>

	<!-- Status Filter Buttons -->
	<div class="mt-4 flex space-x-2">
		<Button
			color={statusFilter == 'all' ? 'blue' : 'light'}
			class="rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
			on:click={() => handleStatusChange('all')}
		>
			All
		</Button>
		<Button
			color={statusFilter == 'for dispatch' ? 'blue' : 'light'}
			class="rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
			on:click={() => handleStatusChange('for dispatch')}
		>
			For Dispatch
		</Button>
		<Button
			color={statusFilter == 'ongoing' ? 'blue' : 'light'}
			class="rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
			on:click={() => handleStatusChange('ongoing')}
		>
			Ongoing
		</Button>
		<Button
			color={statusFilter == 'completed' ? 'blue' : 'light'}
			class="rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
			on:click={() => handleStatusChange('completed')}
		>
			Completed
		</Button>
	</div>

	<!-- Right-Aligned Buttons -->
	<div slot="end" class="flex items-center justify-center space-x-2">
		{#if isNational}
			<Button
				class="whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
				on:click={() => openModal('sync')}
				disabled={isSyncing}
			>
				{#if isSyncing}
					<span class="loader"></span>
				{:else}
					<ArrowsRepeatOutline size="sm" /> Sync
				{/if}
			</Button>
		{/if}
		{#if isNational}
		<Button
			class="flex items-center gap-2 whitespace-nowrap rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:focus:ring-indigo-400"
			on:click={() => openModal('clear_forms')}
			disabled={selectedTasks.length == 0}
		>
			<ReplySolid size="sm" /> Reset PPIC Forms
		</Button>
		
		<Button
			color="red"
			class="flex items-center gap-2 whitespace-nowrap rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
			on:click={() => openModal('delete_multiple')}
			disabled={selectedTasks.length == 0}
		>
			<TrashBinSolid size="sm" /> Delete Tasks
		</Button>
	
		<Button
			class="flex items-center gap-2 whitespace-nowrap rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
			on:click={() => openTaskModal(null)}
		>
			<PlusOutline size="sm" /> Add Task
		</Button>
		{/if}
	</div>
</Toolbar>
