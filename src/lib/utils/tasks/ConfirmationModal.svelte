<script lang="ts">
	import { Button, Label, Input } from 'flowbite-svelte';
	import { ExclamationCircleSolid } from 'flowbite-svelte-icons';

	export let modalType: string;
	export let handleBulkAction: () => void;
	export let handleConfirmDelete: (event: any) => void;
	export let closeModal: () => void;

	let deleting = false;
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
		/>
	</Label>
{/if}

<div class="flex items-center justify-center">
	<Button disabled={deleting} color="red" class="mr-2" on:click={ async ()=>{
		deleting = true;
		await handleBulkAction();
		deleting = false;
		closeModal();
	}}>{deleting ? "Deleting tasks...":"Yes, I'm sure"}</Button>
	<Button color="alternative" on:click={closeModal}>No, cancel</Button>
</div>
