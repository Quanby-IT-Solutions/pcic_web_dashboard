<!-- src\routes\(sidebar)\layouts\sidebar\+page.svelte -->
<script lang="ts">
	import type { PageData } from '$lib/utils/types';
	import Dashboard from '$lib/utils/dashboard/Dashboard.svelte';
	import MetaTag from '$lib/utils/general/MetaTag.svelte';
	import Footer from '$lib/utils/general/Footer.svelte';
	export let data: PageData;

	const path: string = '/layouts/sidebar';
	const description: string = 'PCIC Web Dashboard';
	const title: string = 'PCIC Web Dashboard - Sidebar Layout';
	const subtitle: string = 'Sidebar Layout';
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="p-4">
	<Dashboard {data} />
</main>
<Footer />
