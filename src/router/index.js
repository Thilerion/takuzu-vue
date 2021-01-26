import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue';
import NotFound from '../views/NotFound';
import Menu from '../views/Menu';

import FreePlay from '../views/FreePlay';
import DailyPuzzles from '../views/DailyPuzzles';
import Arcade from '../views/Arcade';

import HowToPlay from '../views/HowToPlay';
import Settings from '../views/Settings';
import Tools from '../views/Tools';
import Statistics from '../views/Statistics';



const routes = [
	{
		path: '/',
		name: 'MainMenu',
		component: Home,
		meta: {
			hasBottomNav: true,
			depth: 0,
			noBackButton: true
		}
	},
	{
		path: '/play',
		name: 'FreePlay',
		component: FreePlay,
		meta: {
			hasBottomNav: false,
			depth: 1,
		}
	},
	{
		path: '/daily',
		name: 'DailyPuzzles',
		component: DailyPuzzles,
		meta: {
			hasBottomNav: false,
			depth: 1,
		}
	},
	{
		path: '/arcade',
		name: 'Arcade',
		component: Arcade,
		meta: {
			hasBottomNav: false,
			depth: 1,
		}
	},
	{
		path: '/how-to-play',
		name: 'HowToPlay',
		component: HowToPlay,
		meta: {
			hasBottomNav: true,
			depth: 0,
		}
	},
	{
		path: '/settings',
		name: 'Settings',
		component: Settings,
		meta: {
			hasBottomNav: true,
			depth: 0,
			noBackButton: true
		}
	},
	{
		path: '/tools',
		name: 'Tools',
		component: Tools,
		meta: {
			hasBottomNav: true,
			depth: 0,
			noBackButton: true
		}
	},
	{
		path: '/stats',
		name: 'Statistics',
		component: Statistics,
		meta: {
			hasBottomNav: true,
			depth: 0,
			noBackButton: true
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
			hasBottomNav: true,
			depth: 0,
		}
	}
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
});

router.afterEach((to, from) => {
	// transition based on depth (slideup or fade)
	const toDepth = to.meta.depth || 0;
	const fromDepth = from.meta.depth || 0;

	if (toDepth === fromDepth) {
		to.meta.transitionName = 'fade';
		to.meta.transitionMode = 'out-in';
	} else if (toDepth > fromDepth) {
		to.meta.transitionName = 'slide-in';
		to.meta.transitionMode = 'in-out';
	} else if (toDepth < fromDepth) {
		to.meta.transitionName = 'slide-out';
		to.meta.transitionMode = null;
	}
})

export default router
