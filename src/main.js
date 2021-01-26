import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

// base components
import PageHeader from '@/components/base-layout/PageHeader';
import IconBtn from '@/components/base-layout/IconBtn';

import { initTheme } from './dark-mode';
initTheme();

import "./assets/css/main.css";

const app = createApp(App)
	.use(store)
	.use(router)
	.component('PageHeader', PageHeader)
	.component('IconBtn', IconBtn);
	
app.mount('#app');

