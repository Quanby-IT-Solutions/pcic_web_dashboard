<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { ArrowsRepeatOutline } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let isScanning: boolean;
	export let isSyncing: boolean;
	export let scannedFiles: any;
	export let currentlySyncing: string | null;

	function syncWithFTP() {
		dispatch('syncWithFTP');
	}

	function scanFTP() {
		dispatch('scanFTP');
	}
</script>

<div class="mx-auto mb-4 mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-green-500">
	<ArrowsRepeatOutline class="h-10 w-10 text-white" />
</div>

{#if isScanning}
	<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
		Please wait for the system to finish scanning the FTP server
	</h3>
{:else if isSyncing}
	<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
		Please wait for the system to finish syncing the FTP server
	</h3>
{:else}
	<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
		Here are the list of files synced from the FTP Server
	</h3>
{/if}

<div
	class="flex h-96 w-full flex-col items-center gap-2 overflow-y-scroll rounded-xl bg-black/10 p-4"
>
	{#each Object.keys(scannedFiles) as file}
		<div
			class="{scannedFiles[file].scanning || currentlySyncing == file
				? 'bg-gray-600 dark:bg-gray-400/10 '
				: 'bg-gray-800 dark:bg-black/10'} flex min-h-16 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded px-4 hover:bg-gray-600 dark:hover:bg-gray-400/10"
		>
			<div class="text-white">
				{file}
			</div>
			{#if scannedFiles[file].scanning}
				<div class="text-sm text-gray-400">Scanning</div>
			{:else if scannedFiles[file].rows.length > 0}
				<div class="text-sm text-orange-400">
					{scannedFiles[file].synced.length} / {scannedFiles[file].length} synced
				</div>
			{:else if currentlySyncing == file}
				<div class="text-sm text-green-500">Syncing...</div>
			{:else}
				<div class="text-sm text-green-500">Synced</div>
			{/if}
		</div>
	{/each}

	{#if isScanning}
		<div>
			<span class="loader"></span>
			<span class="text-gray-40 mt-2 text-sm">
				{Object.keys(scannedFiles).find((file) => scannedFiles[file].scanning) == null
					? 'Please wait ...'
					: 'Scanning a file ...'}
			</span>
		</div>
	{:else if isSyncing}
		<div>
			<span class="loader"></span>
			<span class="text-gray-40 mt-2 text-sm">
				{currentlySyncing == null ? 'Please wait ...' : 'Syncing a file ...'}
			</span>
		</div>
	{:else if Object.keys(scannedFiles).length <= 0}
		<div class="flex h-full w-full items-center justify-center">
			No files listed, press 'Scan FTP Server' to scan for files.
		</div>
	{/if}
</div>

<div class="flex items-center justify-center">
	<Button
		color="red"
		class="mr-2"
		disabled={isScanning || isSyncing || Object.keys(scannedFiles).length <= 0}
		on:click={syncWithFTP}
	>
		{#if isSyncing}
			<span class="loader mr-2"></span> Sync to Database
		{:else}
			Sync to Database
		{/if}
	</Button>
	<Button color="red" class="mr-2" disabled={isScanning || isSyncing} on:click={scanFTP}>
		{#if isScanning}
			<span class="loader mr-2"></span> Scan FTP Server
		{:else}
			Scan FTP Server
		{/if}
	</Button>
</div>
