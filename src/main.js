import { createApp } from 'vue';
import './tailwind.css';
import App from './App.vue';

import { registerGlobalComponents } from './global-components.js';

import { registerSW } from 'virtual:pwa-register';

const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;
const updateSW = registerSW({
	immediate: true,
	onRegistered(r) {
		r && setInterval(() => {
			r.update();
		}, SW_UPDATE_INTERVAL_MS)
	}
})

// const pkgVersion = import.meta.env.PACKAGE_VERSION;
const buildDate = __BUILD_DATE__;
const pkgVersion = __PKG_VERSION__;

console.log({ buildDate, pkgVersion });

import router from './router';
import store from './store';

const app = createApp(App)
	.use(store)
	.use(router);

registerGlobalComponents(app);
	
app.mount('#app')
