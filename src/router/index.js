import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue';
import NotFound from '../views/NotFound';
import Menu from '../views/Menu';

const routes = [
	{
		path: '/',
		name: 'MainMenu',
		component: Home,
		meta: {
			hasBottomNav: true
		}
	},
	{
		path: '/play',
		name: 'FreePlay',
		component: () => import(/* webpackChunkName: "play" */ '../views/FreePlay.vue'),
		meta: {
			hasBottomNav: false,
			isOverlay: true,
			transition: 'slide'
		}
	},
	{
		path: '/daily',
		name: 'DailyPuzzles',
		component: () => import(/* webpackChunkName: "play" */ '../views/DailyPuzzles.vue'),
		meta: {
			hasBottomNav: false,
			isOverlay: true,
			transition: 'slide'
		}
	},
	{
		path: '/arcade',
		name: 'Arcade',
		component: () => import(/* webpackChunkName: "play" */ '../views/Arcade.vue'),
		meta: {
			hasBottomNav: false,
			isOverlay: true,
			transition: 'slide'
		}
	},
	{
		path: '/how-to-play',
		name: 'HowToPlay',
		component: () => import(/* webpackChunkName: "how-to-play" */ '../views/HowToPlay.vue'),
		meta: {
			hasBottomNav: true
		}
	},
	{
		path: '/settings',
		name: 'Settings',
		component: () => import(/* webpackChunkName: "settings" */ '../views/Settings.vue'),
		meta: {
			hasBottomNav: true
		}
	},
	{
		path: '/tools',
		name: 'Tools',
		component: () => import(/* webpackChunkName: "tools" */ '../views/Tools.vue'),
		meta: {
			hasBottomNav: true
		}
	},
	{
		path: '/stats',
		name: 'Statistics',
		component: () => import(/* webpackChunkName: "stats" */ '../views/Statistics.vue'),
		meta: {
			hasBottomNav: true
		}
	},
	{
		path: '/menu',
		name: 'Menu',
		component: Menu
	},
	{
		path: '/:pathMatch(.*)*',
		component: NotFound,
		meta: {
			hasBottomNav: true
		}
	}
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
