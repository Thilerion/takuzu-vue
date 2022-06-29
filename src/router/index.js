import { createRouter, createWebHistory } from 'vue-router';

// MAIN ROUTES
import MainPage from '@/components/base/layout/MainPage.vue';
import Home from '../views/Home.vue';
import HowToPlay from '../views/HowToPlay.vue';
import Tutorial from '../views/Tutorial.vue';
import Statistics from '../views/Statistics.vue';
import Settings from '../views/Settings.vue';

// NESTED PAGES / OVERLAY PAGES
import FreePlay from '../views/NewPuzzle.vue';

import PlayPuzzle from '../views/PlayPuzzle.vue';

// 404 Page
import NotFound from '../views/NotFound.vue';
import { useRouteDocumentTitle } from './useDocumentTitle';
import { useMetaThemeColor } from './useMetaThemeColor';

const routes = [
	{
		path: '',
		name: 'TopLevelMain',
		component: MainPage,
		meta: {
			metaThemeColor: 'white',
		},
		children: [
			{
				path: '',
				name: 'Home',
				component: Home,
				meta: {
					metaThemeColor: '#4DBA87'
				}
			},
			{
				path: '/stats',
				name: 'Statistics',
				component: Statistics,
				meta: {
					title: 'Statistics'
				}
			},
			{
				path: '/stats/history',
				name: 'PuzzleHistory',
				component: () => import('../views/PuzzleHistoryView.vue'),
				meta: {
					title: 'Statistics - Puzzle History'
				}
			},
			{
				path: '/stats/table',
				name: 'PuzzleStatisticsTable',
				component: () => import('../views/PuzzleStatisticsTable.vue'),
				meta: {
					title: 'Statistics - Puzzles'
				}
			},
			{
				path: '/settings',
				name: 'Settings',
				component: Settings,
				meta: {
					title: 'Settings'
				},
				props: {
					hideBack: true
				}
			},
			{
				path: '/tools',
				component: () => import('../views/PuzzleTools.vue'),
				name: 'PuzzleTools',
				meta: {
					title: 'Tools'
				}
			},
			{
				path: '/debug-options',
				name: 'DebugOptions',
				component: () => import('../views/DebugOptions.vue')
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
		path: '/custom-create',
		component: () => import('../views/PuzzleInput.vue'),
		name: 'PuzzleInput',
		meta: {
			title: 'Custom Puzzle',
		}
	},
	{
		path: '/analysis',
		component: () => import('../views/analysis/PuzzleAnalysis.vue'),
		name: 'PuzzleAnalysis',
		meta: {
			title: 'Puzzle Analysis'
		}
	},
	{
		path: '/showcase',
		component: () => import('../views/BaseComponentShowcase.vue'),
		name: 'BaseComponentShowcase'
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// resolve(savedPosition ?? { top: 0, behavior: 'smooth' });
				resolve({ top: 0, left: 0 });
			}, 200);
		})
	}
});

const { updateTitleWithRouteMeta } = useRouteDocumentTitle({
	defaultTitle: 'Takuzu',
	titlePrefix: 'Takuzu - '
});
const { updateThemeColorWithRouteMeta } = useMetaThemeColor();

router.afterEach((to, from) => {
	// set document title based on route
	updateTitleWithRouteMeta(to, from);
	updateThemeColorWithRouteMeta(to, from);

	// set previous route, for better back-button navigation
	if (from && from.matched && from.matched.length) {
		to.meta.prev = from;
	} else {
		to.meta.prev = null;
	}
})

export default router;