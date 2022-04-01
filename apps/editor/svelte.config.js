import adapter from '@sveltejs/adapter-static';
import { resolve } from 'path';
import preprocess from 'svelte-preprocess';

const { ROOT_PATH = resolve('../../test') } = process.env;
process.env.VITE_ROOT_PATH = ROOT_PATH;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		prerender: {
			default: true,
			crawl: true,
			entries: ['*', '/', '/edit', '/edit/*']
		},
		vite: {
			build: {
				target: 'ESNext'
			}
		},
		adapter: adapter({ fallback: null })
	}
};

export default config;
