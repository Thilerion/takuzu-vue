import { createApp } from 'vue';
import './fonts.css';
import './tailwind.css';
import App from './App.vue';

import { registerGlobalComponents } from './global-components.js';

import { registerSW } from 'virtual:pwa-register';

import router from './router';
import { createPinia } from 'pinia';

const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;
const updateSW = registerSW({
	immediate: true,
	onRegistered(r) {
		r && setInterval(() => {
			r.update();
		}, SW_UPDATE_INTERVAL_MS)
	}
})

const app = createApp(App)
	.use(router)
	.use(createPinia())

registerGlobalComponents(app);
	
app.mount('#app')
