import adapter from '@sveltejs/adapter-static';
import { resolve } from 'path';
import preprocess from 'svelte-preprocess';

process.env.VITE_ROOT_PATH = resolve('../../test/');

let alias = {};

if (process.env.NODE_ENV === 'production') {
	alias = {
		// path: './polyfills/path.ts',
		// 'fs/promises': './polyfills/fs.ts'
	};
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		prerender: {
			default: true
		},
		vite: {
			build: {
				target: 'ESNext'
			},
			resolve: {
				alias
			}
		},
		adapter: adapter({ fallback: null })
	}
};

export default config;
