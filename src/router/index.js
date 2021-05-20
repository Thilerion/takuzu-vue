import { createRouter, createWebHistory } from 'vue-router';

// MAIN ROUTES
import MainPage from '@/components/base-layout/MainPage';
import Home from '../views/Home.vue';
import HowToPlay from '../views/HowToPlay';
import Tutorial from '../views/Tutorial';
import Statistics from '../views/Statistics';
import Settings from '../views/Settings';
import Menu from '../views/Menu';

// NESTED PAGES / OVERLAY PAGES
import FreePlay from '../views/FreePlay';

import PlayPuzzle from '../views/PlayPuzzle';

// 404 Page
import NotFound from '../views/NotFound';

const routes = [
	{
		path: '/',
		component: MainPage,
		children: [
			{
				path: '',
				name: 'MainMenu',
				component: Home,
			},
			{
				path: '/stats',
				name: 'Statistics',
				component: Statistics,
			},
			{
				path: '/settings',
				name: 'Settings',
				component: Settings
			},
			{
				path: '/menu',
				name: 'MoreMenu',
				component: Menu,
			},
			{
				path: '/:pathMatch(.*)*',
				name: 'NotFound',
				component: NotFound
			}
		]
	},
	{
		path: '/help',
		name: 'HowToPlay',
		component: HowToPlay,
	},
	{
		path: '/help/tutorial',
		name: 'Tutorial',
		component: Tutorial,
	},
	{
		path: '/play',
		component: FreePlay,
		name: 'FreePlay',
		children: [
			{
				path: 'settings',
				component: Settings
			}
		]
	},
	{
		path: '/puzzle',
		component: PlayPuzzle,
		name: 'PlayPuzzle'
	},
	{
		path: '/showcase',
		component: () => import('../views/BaseComponentShowcase.vue'),
		name: 'BaseComponentShowcase'
	}
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
});

router.beforeEach((to, from) => {
	// set document title based on route
	let title = 'Takuzu';
	if (to.meta.title) {
		title += ' - ' + to.meta.title;
	}
	document.title = title;
})

router.afterEach((to, from) => {
	if (from && from.matched && from.matched.length) {
		to.meta.prev = from;
	} else {
		to.meta.prev = null;
	}
})

export default router
