import { createApp } from 'vue';
import './tailwind.css';
import App from './App.vue';

import { registerGlobalComponents } from './global-components.js';

import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

import router from './router';
import store from './store';

const app = createApp(App)
	.use(store)
	.use(router);

registerGlobalComponents(app);
	
app.mount('#app')
