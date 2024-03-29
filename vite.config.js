import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path'

import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';
import copy from 'rollup-plugin-copy';

import { createVitePwaConfig } from './pwa.config.js'

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
				'@': resolve(__dirname, 'src'),
			},
		},
		define: {
			__BUILD_DATE__: JSON.stringify(
				(() => {
					// include correction for timezone offset in ISO string
					const date = new Date();
					const offset = date.getTimezoneOffset() * 60000;
					const offsetDate = new Date(date.getTime() - offset);
					return offsetDate.toISOString().slice(0, 16);
				})()
			),
			__PKG_VERSION__: JSON.stringify(process.env.npm_package_version),
		}
	}
})