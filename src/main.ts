import './assets/fonts.css';
import './assets/tailwind.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

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
app.use(router);
app.use(createPinia());

app.mount('#app')
