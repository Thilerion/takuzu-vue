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

import { ErrorHandler } from './services/error-handler';

import { initTheme } from './services/dark-mode';
initTheme();

import "./assets/css/main.css";

const errorHandler = new ErrorHandler();
if (process.env.NODE_ENV === 'development') errorHandler.toggleAlertErrors(true);
window._GLOBAL_ERROR_HANLDER = errorHandler;

const app = createApp(App)
	.use(store)
	.use(router)
	.component('PageHeader', PageHeader)
	.component('BottomNav', BottomNav)
	.component('IconBtn', IconBtn);

registerGlobalComponents(app);

app.config.errorHandler = (err, vm, info) => {
	errorHandler.handleError(err, 'vue', info);
}
app.config.globalProperties.errorHandler = errorHandler;
	
app.mount('#app');
