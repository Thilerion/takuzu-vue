import './assets/fonts.css';
import './assets/tailwind.css';

import { createApp, watch, markRaw } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { setI18nLanguage, setupI18n, type SupportedLocale } from './i18n/index.js';

import { registerSW } from 'virtual:pwa-register';

const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;
/* const updateSW =  */registerSW({
	immediate: true,
	onRegistered(r) {
		r && window.setInterval(() => {
			r.update();
		}, SW_UPDATE_INTERVAL_MS)
	}
})

const app = createApp(App);
const i18n = setupI18n();
const pinia = createPinia();
pinia.use(({ store }) => {
	store.i18n = markRaw(i18n.global);
	if (store.$id === 'settings') {
		watch(() => store.language, (newLang) => {
			console.log({ newLang });
			setI18nLanguage(i18n, newLang as unknown as SupportedLocale);
		}, { immediate: true })
	}
})

declare module 'pinia' {
	export interface PiniaCustomProperties {
		i18n: typeof i18n['global'];
	}
}

app.use(i18n);
app.use(router);
app.use(pinia);

app.mount('#app')
