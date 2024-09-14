<script lang="ts">
	import '../app.pcss';
	import { page } from '$app/stores';
	import NotFound from '$lib/utils/extra-pages/NotFound.svelte';
	import Maintenance from '$lib/utils/extra-pages/Maintenance.svelte';
	import ServerError from '$lib/utils/extra-pages/ServerError.svelte';
	import MetaTag from '$lib/utils/general/MetaTag.svelte';

	type ErrorCode = 400 | 404 | 500;

	const pages: Record<ErrorCode, typeof NotFound | typeof Maintenance | typeof ServerError> = {
		400: Maintenance,
		404: NotFound,
		500: ServerError
	};

	const status = $page.status;
	const validErrorCodes: ErrorCode[] = [400, 404, 500];
	const index = validErrorCodes.reduce((p, c) => (c <= status ? c : p));
	const component = pages[index as ErrorCode];

	const path: string = `/errors/${index}`;
	const description: string = `${index} - PCIC Web Dashboard`;
	const title: string = `PCIC Web Dashboard - ${index} page`;
	const subtitle: string = `${index} page`;
</script>

<MetaTag {path} {description} {title} {subtitle} />

<svelte:component this={component} />
