import { createRouter, createWebHistory } from 'vue-router';

// MAIN ROUTES
import MainPage from '@/components/global/base-layout/MainPage.vue';
import Home from '../views/Home.vue';
import HowToPlay from '../views/HowToPlay.vue';
import Tutorial from '../views/Tutorial.vue';
import Statistics from '../views/Statistics.vue';
import Statistics2 from '../views/Statistics2.vue';
import PuzzleHistoryView from '../views/PuzzleHistoryView.vue';
import Settings from '../views/Settings.vue';
import Menu from '../views/Menu.vue';

// NESTED PAGES / OVERLAY PAGES
import FreePlay from '../views/NewPuzzle.vue';

import PlayPuzzle from '../views/PlayPuzzle.vue';

// 404 Page
import NotFound from '../views/NotFound.vue';
import { useRouteDocumentTitle } from './useDocumentTitle';

const routes = [
	{
		path: '',
		name: 'TopLevelMain',
		component: MainPage,
		meta: {
			metaThemeColors: {
				light: 'white',
				dark: 'black'
			}
		},
		children: [
			{
				path: '',
				name: 'Home',
				component: Home,
			},
			{
				path: '/stats-old',
				name: 'StatisticsOld',
				component: Statistics,
				meta: {
					title: 'Statistics [old]'
				}
			},
			{
				path: '/stats',
				name: 'Statistics',
				component: Statistics2,
				meta: {
					title: 'Statistics'
				}
			},
			{
				path: '/stats/history',
				name: 'PuzzleHistory',
				component: PuzzleHistoryView,
				meta: {
					title: 'Statistics - Puzzle History'
				}
			},
			{
				path: '/settings',
				name: 'Settings',
				component: Settings,
				meta: {
					title: 'Settings'
				}
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
		name: 'NewPuzzleFreePlay',
		meta: {
			title: 'New Game'
		}
	},
	{
		path: '/puzzle',
		component: PlayPuzzle,
		name: 'PlayPuzzle',
		meta: {
			title: 'Play Puzzle',
			usePuzzleKey: true,
		},
		children: [
			{
				path: 'settings',
				name: 'PlayPuzzle.settings',
				component: Settings
			}
		]
	},
	{
		path: '/showcase',
		component: () => import('../views/BaseComponentShowcase.vue'),
		name: 'BaseComponentShowcase'
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
});

const { updateTitleWithRouteMeta } = useRouteDocumentTitle({
	defaultTitle: 'Takuzu',
	titlePrefix: 'Takuzu - '
});

router.beforeEach((to, from) => {
	// set document title based on route
	updateTitleWithRouteMeta(to, from);
})

router.afterEach((to, from) => {
	if (from && from.matched && from.matched.length) {
		to.meta.prev = from;
	} else {
		to.meta.prev = null;
	}
})

export default router;