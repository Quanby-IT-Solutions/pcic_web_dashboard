<!-- src\routes\(sidebar)\+page.svelte -->
<script lang="ts">
	import type { PageData } from '$lib/utils/types';
	import Dashboard from '$lib/utils/dashboard/Dashboard.svelte';
	import MetaTag from '$lib/utils/general/MetaTag.svelte';

	export let data: PageData;

	const path: string = '';
	const description: string = 'Admin Dashboard';
	const title: string = 'PCIC Web Dashboard - Home';
	const subtitle: string = 'Admin Dashboard';
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="p-4">
	<Dashboard {data} />
</main>
