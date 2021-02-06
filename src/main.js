import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

// install all global components
import { registerGlobalComponents } from './components/global';

// base components
import PageHeader from '@/components/base-layout/PageHeader';
import IconBtn from '@/components/base-layout/IconBtn';
import BottomNav from '@/components/base-layout/BottomNav';

import { initTheme } from './services/dark-mode';
initTheme();

import "./assets/css/main.css";

const app = createApp(App)
	.use(store)
	.use(router)
	.component('PageHeader', PageHeader)
	.component('BottomNav', BottomNav)
	.component('IconBtn', IconBtn);

registerGlobalComponents(app);
	
app.mount('#app');

