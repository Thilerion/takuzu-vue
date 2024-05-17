import './assets/fonts.css';
import './assets/tailwind.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { i18n, i18nPiniaPropertyPlugin } from './i18n/index.js';

import { registerSW } from 'virtual:pwa-register';
import { themePreferencesPlugin } from './features/settings/composables/use-theme-preferences.js';

const SW_UPDATE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
registerSW({
	immediate: true,
	onRegisteredSW(swUrl, r) {
		console.log(`Service Worker at url: ${swUrl}`);
		r && setInterval(async () => {
			if (!navigator?.onLine) return;

			console.log('Checking for sw update');
			// fetch first to ensure server is not down
			const resp = await fetch(swUrl, {
				method: 'HEAD', // request headers only
				cache: 'no-store',
				headers: {
					'cache': 'no-store',
					'cache-control': 'no-cache'
				},
			});

			if (resp?.status === 200 && resp.ok) {
				await r.update(); // pings server to check for updated sw
			}

		}, SW_UPDATE_INTERVAL_MS)
	}
});

const app = createApp(App);
const pinia = createPinia();
pinia.use(i18nPiniaPropertyPlugin);

app.use(i18n);
app.use(router);
app.use(pinia);
app.use(themePreferencesPlugin);

if (import.meta.env.DEV) {
	app.config.performance = true;
}

app.mount('#app')
