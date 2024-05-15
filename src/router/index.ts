import { createRouter, createWebHistory } from 'vue-router';

declare module 'vue-router' {
	interface RouteMeta {
		metaThemeColor?: string;
		metaThemeColors?: Record<BaseTheme, string>;
		title?: string;
		usePuzzleKey?: boolean;
		prev?: RouteLocationNormalized | null;
	}
}

// MAIN ROUTES
import MainPage from '@/components/base/layout/MainPage.vue';
import HomePage from '../views/HomePage.vue';
const HowToPlay = () => import('../views/HowToPlay.vue');
const TutorialPage = () => import('../views/TutorialPage.vue');
const SettingsPage = () => import('../views/SettingsPage.vue');

// NESTED PAGES / OVERLAY PAGES
import FreePlay from '../views/NewPuzzle.vue';
import PlayPuzzle from '../views/PlayPuzzle.vue';

// 404 Page
import NotFound from '../views/NotFound.vue';

import { useRouteDocumentTitle } from './useDocumentTitle';
import { useSavedPuzzle } from '@/services/savegame/useSavedGame.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import type { RouteRecordRaw } from 'vue-router';
import type { BaseTheme } from '@/composables/use-theme-preferences.js';

const routes = [
	{
		path: '',
		name: 'TopLevelMain',
		component: MainPage,
		meta: {
			metaThemeColors: {
				light: 'white',
				dark: '#1e293b'
			},
			title: '', // use base title
		},
		children: [
			{
				path: '',
				name: 'Home',
				component: HomePage,
				meta: {
					metaThemeColors: {
						light: '#4DBA87',
						dark: '#0d9488'
					},
					title: '', // use base title
				}
			},
			{
				path: '/statistics',
				redirect: '/stats',
			},
			{
				path: '/stats',
				children: [
					{
						path: '',
						name: 'Statistics',
						component: () => import('../views/StatisticsPageNext.vue'),
						meta: {
							title: 'Statistics'
						}
					},
					{
						path: 'history',
						name: 'StatisticsHistory',
						component: () => import('../views/StatisticsPuzzleHistoryPage.vue'),
						meta: {
							title: 'Statistics - Puzzle History'
						}
					}
				]
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
		meta: {
			title: 'How to Play'
		},
		children: [
			{
				path: '',
				name: 'HowToPlayOverview',
				component: () => import('@/components/how-to-play/HowToPlayOverview.vue'),
			},
			{
				path: 'rules',
				name: 'PuzzleRulesInfo',
				component: () => import('@/components/how-to-play/PuzzleRulesInfo.vue'),
			},
			{
				path: 'techniques',
				name: 'BasicTechniques',
				component: () => import('@/components/how-to-play/BasicTechniques.vue'),
			},
			{
				path: 'advanced',
				name: 'AdvancedTechniques',
				component: () => import('@/components/how-to-play/AdvancedTechniques.vue')
			}
		]
	},
	{
		path: '/help/tutorial',
		name: 'Tutorial',
		component: TutorialPage,
		meta: {
			title: 'Tutorial'
		}
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
		beforeEnter: (to, from, next) => {
			const puzzleStore = usePuzzleStore();
			if (!puzzleStore.initialized) {
				const { hasCurrentSavedGame } = useSavedPuzzle();
				if (hasCurrentSavedGame.value) {
					puzzleStore.loadSavedPuzzle();
					return next();
				}
				console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
				return next({ name: 'NewPuzzleFreePlay', replace: true });
			}
			next();
		},
		children: [
			{
				path: 'settings',
				name: 'PlayPuzzle.settings',
				component: SettingsPage,
				meta: {
					title: 'Play Puzzle - Settings'
				}
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
		name: 'BaseComponentShowcase',
		meta: {
			title: 'Component Showcase'
		}
	}
] as const satisfies RouteRecordRaw[];

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

router.afterEach((to, from) => {
	// set document title based on route
	updateTitleWithRouteMeta(to);

	// set previous route, for better back-button navigation
	if (from && from.matched && from.matched.length) {
		to.meta.prev = from;
	} else {
		to.meta.prev = null;
	}
})

export default router;