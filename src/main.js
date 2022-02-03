import { createApp } from 'vue';
import './tailwind.css';
import App from './App.vue';

import { registerGlobalComponents } from './global-components.js';

import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true });

const pkgVersion = import.meta.env.PACKAGE_VERSION;
const gitRevision = import.meta.env.VERSION;
const metaEnv = import.meta.env;

console.log({ pkgVersion, gitRevision, metaEnv });

import router from './router';
import store from './store';

const app = createApp(App)
	.use(store)
	.use(router);

registerGlobalComponents(app);
	
app.mount('#app')
