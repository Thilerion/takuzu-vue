import { createRouter, createWebHistory } from 'vue-router';

declare module 'vue-router' {
	interface RouteMeta {
		metaThemeColor?: string;
		title?: string;
		usePuzzleKey?: boolean;
	}
}

// MAIN ROUTES
import MainPage from '@/components/base/layout/MainPage.vue';
import HomePage from '../views/HomePage.vue';
import HowToPlay from '../views/HowToPlay.vue';
import TutorialPage from '../views/TutorialPage.vue';
import StatisticsPage from '../views/StatisticsPage.vue';
import SettingsPage from '../views/SettingsPage.vue';

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
				component: HomePage,
				meta: {
					metaThemeColor: '#4DBA87'
				}
			},
			{
				path: '/stats',
				name: 'Statistics',
				component: StatisticsPage,
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
				component: SettingsPage,
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
		component: TutorialPage,
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
				component: SettingsPage
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
	scrollBehavior() {
		return new Promise((resolve) => {
			window.setTimeout(() => {
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
	updateTitleWithRouteMeta(to);
	updateThemeColorWithRouteMeta(to);

	// set previous route, for better back-button navigation
	if (from && from.matched && from.matched.length) {
		to.meta.prev = from;
	} else {
		to.meta.prev = null;
	}
})

export default router;