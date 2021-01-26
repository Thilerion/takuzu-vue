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
			hasBottomNav: true,
			depth: 0,
		}
	},
	{
		path: '/play',
		name: 'FreePlay',
		component: () => import(/* webpackChunkName: "play" */ '../views/FreePlay.vue'),
		meta: {
			hasBottomNav: false,
			depth: 1,
		}
	},
	{
		path: '/daily',
		name: 'DailyPuzzles',
		component: () => import(/* webpackChunkName: "play" */ '../views/DailyPuzzles.vue'),
		meta: {
			hasBottomNav: false,
			depth: 1,
		}
	},
	{
		path: '/arcade',
		name: 'Arcade',
		component: () => import(/* webpackChunkName: "play" */ '../views/Arcade.vue'),
		meta: {
			hasBottomNav: false,
			depth: 1,
		}
	},
	{
		path: '/how-to-play',
		name: 'HowToPlay',
		component: () => import(/* webpackChunkName: "how-to-play" */ '../views/HowToPlay.vue'),
		meta: {
			hasBottomNav: true,
			depth: 0,
		}
	},
	{
		path: '/settings',
		name: 'Settings',
		component: () => import(/* webpackChunkName: "settings" */ '../views/Settings.vue'),
		meta: {
			hasBottomNav: true,
			depth: 0,
		}
	},
	{
		path: '/tools',
		name: 'Tools',
		component: () => import(/* webpackChunkName: "tools" */ '../views/Tools.vue'),
		meta: {
			hasBottomNav: true,
			depth: 0,
		}
	},
	{
		path: '/stats',
		name: 'Statistics',
		component: () => import(/* webpackChunkName: "stats" */ '../views/Statistics.vue'),
		meta: {
			hasBottomNav: true,
			depth: 0,
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
