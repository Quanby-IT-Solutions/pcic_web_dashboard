<!-- src\routes\(sidebar)\dashboard\+page.svelte -->
<script lang="ts">
	import Dashboard from '$lib/utils/dashboard/Dashboard.svelte';
	import MetaTag from '$lib/utils/general/MetaTag.svelte';
	import type { PageData } from '$lib/utils/types';

	export let data: PageData;

	const path: string = '/dashboard';
	const description: string = 'Admin Dashboard';
	const title: string = 'PCIC Web Dashboard - Dashboard';
	const subtitle: string = 'Admin Dashboard';
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="p-4">
	<Dashboard {data} />
</main>
