<script lang="ts">
	import { onMount } from 'svelte';
	import Reports from './Reports.svelte';
	import type { PageData } from '$lib/utils/types';

	export let data: PageData;

	let dark = false;
	function handler(ev: Event) {
		if ('detail' in ev) {
			dark = !!ev.detail;
		}
	}
	onMount(() => {
		document.addEventListener('dark', handler);
		return () => document.removeEventListener('dark', handler);
	});
</script>

<div class="mt-px space-y-4">
	<Reports {data} />
</div>
