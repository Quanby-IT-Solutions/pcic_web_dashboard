import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess({})],

	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib'
			// MAR: Add any other aliases you need here, for example:
			// '$components': 'src/lib/components',
			// '$utils': 'src/lib/utils'
		}
	}
};

export default config;
