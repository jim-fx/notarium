import adapter from '@sveltejs/adapter-static';
import { resolve } from 'path';
import preprocess from 'svelte-preprocess';

import UnoCss from 'unocss/vite'
import { extractorSvelte } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'


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
      build: { target: "ESNext" },
      plugins: [UnoCss({ presets: [presetUno(), presetIcons()], extractors: [extractorSvelte] })]
    },
    adapter: adapter({ fallback: null })
  }
};

export default config;
