import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	try {
		const post = await import(`../${params.slug}.svelte`);
		return {
			content: post.default
			// Uncomment these if you need them in the future
			// title: post.metadata?.title,
			// dir: post.metadata?.dir
		};
	} catch (error) {
		console.error(`Failed to load authentication page: ${params.slug}`, error);
		return {
			content: null
		};
	}
};
