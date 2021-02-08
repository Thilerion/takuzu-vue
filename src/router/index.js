import { createRouter, createWebHistory } from 'vue-router';

// MAIN ROUTES
import MainPage from '@/components/base-layout/MainPage';
import Home from '../views/Home.vue';
import HowToPlay from '../views/HowToPlay';
import Tools from '../views/Tools';
import Statistics from '../views/Statistics';
import Settings from '../views/Settings';
import Menu from '../views/Menu';

// NESTED PAGES / OVERLAY PAGES
import FreePlay from '../views/FreePlay';
import DailyPuzzles from '../views/DailyPuzzles';
import Arcade from '../views/Arcade';


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
				path: '/how-to-play',
				name: 'HowToPlay',
				component: HowToPlay,
			},
			{
				path: '/tools',
				name: 'Tools',
				component: Tools,
			},
			{
				path: '/stats',
				name: 'Statistics',
				component: Statistics,
			},
			{
				path: '/settings',
				name: 'Settings',
				component: Settings,
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
		path: '/play',
		component: FreePlay,
		name: 'FreePlay'
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

export default router
