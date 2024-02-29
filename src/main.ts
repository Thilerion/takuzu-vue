import './assets/fonts.css';
import './assets/tailwind.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { i18n, i18nPiniaPropertyPlugin } from './i18n/index.js';

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
const pinia = createPinia();
pinia.use(i18nPiniaPropertyPlugin);

app.use(i18n);
app.use(router);
app.use(pinia);

app.mount('#app')
