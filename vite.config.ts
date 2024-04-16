import { fileURLToPath, URL } from 'node:url';
import { BuildVersionDetails, getBuildVersionDetails } from './scripts/build-metadata.js';

import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';
import VueI18n from '@intlify/unplugin-vue-i18n/vite';
import VueDevTools from 'vite-plugin-vue-devtools';

// @ts-ignore TODO 02-07-2022: remove when pwa.config.js is converted to typescript
import { createVitePwaConfig } from './pwa.config.js';
import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ command, mode }) => {
	// load env variables from relevant env file to set manifest app name
	const env = loadEnv(mode, process.cwd());

	// if building for production, create a 200.html fallback for nested routes
	const copyFallback200 = command === 'build' ? viteStaticCopy({
		targets: [
			{ src: 'dist/index.html', dest: '', rename: '200.html' }
		]
	}) : undefined;

	let buildVersionDetails: BuildVersionDetails | { error: unknown };
	try {
		buildVersionDetails = getBuildVersionDetails(mode);
	} catch (e) {
		buildVersionDetails = { error: e };
	}

	return {
		plugins: [
			VueDevTools(),
			vue(),
			VitePWA(createVitePwaConfig({
				name: env.VITE_APP_NAME,
				short_name: env.VITE_APP_SHORT_NAME
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
			VueI18n({
				runtimeOnly: true,
				compositionOnly: true,
				fullInstall: true,
				include: [
					// including js/ts files seems to be bugged when imported using "import messages from @intlify/.../messages", see: https://github.com/intlify/bundle-tools/issues/266. So best to import these separately
					fileURLToPath(new URL('./src/locales/**', import.meta.url)),
				]
			}),
			copyFallback200
		],
		optimizeDeps: {
			exclude: ["dexie-export-import"]
		},
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
			}
		},
		define: {
			__BUILD_VERSION_DETAILS__: JSON.stringify(buildVersionDetails),
			'import.meta.vitest': false
		},
		worker: {
			format: 'es'
		}
	}
})