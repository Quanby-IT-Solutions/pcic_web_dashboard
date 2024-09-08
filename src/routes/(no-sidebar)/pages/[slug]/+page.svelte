<script lang="ts">
	import { DarkMode } from 'flowbite-svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	DarkMode.init();
</script>

<svelte:component this={data.content} />
