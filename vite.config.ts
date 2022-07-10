import { fileURLToPath, URL } from 'url';

import { defineConfig, loadEnv } from 'vite';
import { getBuildVersionDetails } from './scripts/build-metadata.js';

import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';
import copy from 'rollup-plugin-copy';

// @ts-ignore TODO 02-07-2022: remove when pwa.config.js is converted to typescript
import { createVitePwaConfig } from './pwa.config.js';

export default defineConfig(({ command, mode }) => {
	// load env variables from relevant env file to set manifest app name
	process.env = {...process.env, ...loadEnv(mode, process.cwd())};

	// if building for production, create a 200.html fallback for nested routes
	const copyFallback200 = command === 'build' ? copy({
		hook: 'writeBundle',
		targets: [
			{ src: 'dist/index.html', dest: 'dist/', rename: '200.html' }
		]
	}) : undefined;

	const buildVersionDetails = getBuildVersionDetails(mode);

	return {
		plugins: [
			vue(),
			VitePWA(createVitePwaConfig({
				name: process.env.VITE_APP_NAME,
				short_name: process.env.VITE_APP_SHORT_NAME
			})),
			Components({
				extensions: ['vue'],
				include: [/\.vue$/, /\.vue\?vue/],
				dirs: ['src/components', 'src/views'],
				resolvers: [
					IconsResolver({
						prefix: 'icon',
						alias: {
							'his': 'heroicons-solid'
						}
					})
				]
			}),
			Icons({
				defaultClass: 'base-icon',
			}),
			copyFallback200
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
			}
		},
		define: {
			__BUILD_VERSION_DETAILS__: JSON.stringify(buildVersionDetails)
		},
		test: {
			deps: {
				inline: [
					'date-fns/esm', // required by vitest (for now) due to ESM/CJS conflict
				]
			},
			environment: 'jsdom'
		}
	}
})