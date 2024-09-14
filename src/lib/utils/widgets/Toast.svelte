<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import {
		BanOutline,
		CheckCircleSolid,
		ExclamationCircleSolid,
		InfoCircleSolid
	} from 'flowbite-svelte-icons';

	export let show: boolean = false;
	export let message: string = '';
	export let type: 'success' | 'error' | 'info' | 'warning' = 'info';

	function getIcon(type: 'success' | 'error' | 'info' | 'warning') {
		switch (type) {
			case 'success':
				return CheckCircleSolid;
			case 'error':
				return ExclamationCircleSolid;
			case 'info':
				return InfoCircleSolid;
			case 'warning':
				return BanOutline;
			default:
				return InfoCircleSolid;
		}
	}

	function getColor(type: 'success' | 'error' | 'info' | 'warning') {
		switch (type) {
			case 'success':
				return 'green';
			case 'error':
				return 'red';
			case 'info':
				return 'blue';
			case 'warning':
				return 'yellow';
			default:
				return 'blue'; // Default color
		}
	}
</script>

{#if show}
	<div
		class="fixed bottom-5 right-5 z-50"
		in:fly={{ y: -20, duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<div
			class="mb-4 flex w-full max-w-xs items-center p-4 bg-{getColor(
				type
			)}-100 text-gray-500 bg-{getColor(type)}-300 rounded-lg shadow dark:text-{getColor(
				type
			)}-400 dark:bg-{getColor(type)}-800"
			role="alert"
		>
			<div
				class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center bg-{getColor(
					type
				)}-100 text-{getColor(type)}-500 rounded-lg dark:bg-{getColor(
					type
				)}-800 dark:text-{getColor(type)}-200"
			>
				<svelte:component this={getIcon(type)} class="h-5 w-5" />
			</div>
			<div class="ml-3 text-sm font-normal">{message}</div>
			<button
				type="button"
				class="-mx-1.5 -my-1.5 ml-auto bg-{getColor(
					type
				)}-300 rounded-lg p-1.5 text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 hover:bg-{getColor(
					type
				)}-100 inline-flex h-8 w-8 dark:text-white dark:hover:text-white dark:bg-{getColor(
					type
				)}-800 dark:hover:bg-{getColor(type)}-700"
				aria-label="Close"
				on:click={() => (show = false)}
			>
				<span class="sr-only">Close</span>
				<svg
					class="h-5 w-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					></path>
				</svg>
			</button>
		</div>
	</div>
{/if}
