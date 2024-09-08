import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [enhancedImages(), sveltekit()],
	ssr: {
		noExternal: ['flowbite-svelte']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
