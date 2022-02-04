import { defineConfig } from 'vite'
import { resolve } from 'path'

import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';

import { vitePwaConfig } from './pwa.config.js'

export default defineConfig({
	plugins: [
		vue(),
		VitePWA(vitePwaConfig),
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
		})
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	define: {
		__BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 16)),
		__PKG_VERSION__: JSON.stringify(process.env.npm_package_version)
	}
})