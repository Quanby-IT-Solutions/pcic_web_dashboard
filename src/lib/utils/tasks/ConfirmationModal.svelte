<script lang="ts">
	import { Button, Label, Input, Spinner } from 'flowbite-svelte';
	import { ExclamationCircleSolid } from 'flowbite-svelte-icons';

	export let modalType: string;
	export let handleBulkAction: () => void;
	export let handleConfirmDelete: (event: any) => void;
	export let closeModal: () => void;
	export let isBulkActionLoading: boolean;
</script>

<ExclamationCircleSolid class="mx-auto mb-4 mt-8 h-10 w-10 text-red-600" />

<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
	{modalType == 'clear_forms'
		? 'Are you sure you want to reset PPIR forms of the selected tasks?'
		: 'Are you sure you want to permanently delete the selected tasks?'}
</h3>

{#if modalType == 'delete_multiple'}
	<Label class="space-y-2">
		<span>Type 'DELETE' to confirm deletion of selected tasks</span>
		<Input
			on:keyup={handleConfirmDelete}
			name="delete"
			class="border font-normal outline-none"
			placeholder="Type 'DELETE'"
			required
			disabled={isBulkActionLoading}
		/>
	</Label>
{/if}

<div class="mt-4 flex items-center justify-center">
	<Button color="red" class="mr-2" on:click={handleBulkAction} disabled={isBulkActionLoading}>
		{#if isBulkActionLoading}
			<Spinner class="mr-3" size="4" color="white" />
		{/if}
		Yes, I'm sure
	</Button>
	<Button color="alternative" on:click={closeModal} disabled={isBulkActionLoading}>
		No, cancel
	</Button>
</div>
