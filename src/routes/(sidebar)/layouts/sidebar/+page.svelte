<script lang="ts">
	import Dashboard from '../../../utils/dashboard/Dashboard.svelte';
	import MetaTag from '../../../utils/MetaTag.svelte';
	import Footer from '../../Footer.svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	
	const path: string = '/layouts/sidebar';
  const description: string = 'Sidebar layout example - PCIC Web Dashboard';
  const title: string = 'PCIC Web Dashboard - Sidebar Layout';
  const subtitle: string = 'Sidebar Layout';
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="p-4">
	<Dashboard {data} />
</main>
<Footer />