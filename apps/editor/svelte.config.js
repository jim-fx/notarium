import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		vite: {
			resolve: {
				alias: {
					// This Rollup aliases are extracted from @esbuild-plugins/node-modules-polyfill,
					// see https://github.com/remorses/esbuild-plugins/blob/master/node-modules-polyfill/src/polyfills.ts
					// process and buffer are excluded because already managed
					// by node-globals-polyfill
					// stream: 'rollup-plugin-node-polyfills/polyfills/stream'
				}
			},
			optimizeDeps: {
				esbuildOptions: {
					// Node.js global to browser globalThis
					define: {
						global: 'globalThis'
					}
					// Enable esbuild polyfill plugins
				}
			}
		},
		adapter: adapter({
			fallback: '200.html'
		})
	}
};

export default config;
