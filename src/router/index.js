import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue';
import NotFound from '../views/NotFound';

const routes = [
	{
		path: '/',
		name: 'MainMenu',
		component: Home
	},
	{
		path: '/play',
		name: 'FreePlay',
		component: () => import(/* webpackChunkName: "freeplay" */ '../views/FreePlay.vue')
	},
	{
		path: '/:pathMatch(.*)*',
		component: NotFound
	}
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
