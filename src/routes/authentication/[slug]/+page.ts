// src\routes\authentication\[slug]\+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	try {
		const post = await import(`../${params.slug}.svelte`);
		return {
			content: post.default
		};
	} catch (error) {
		console.error(`Failed to load authentication page: ${params.slug}`, error);
		return {
			content: null
		};
	}
};
