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
import type { RouteRecordRaw } from 'vue-router';
import { usePuzzleStatusStore } from '@/stores/puzzle/status-store.js';
import { createRouter, createWebHistory } from 'vue-router';
import { i18n } from '@/i18n/index.js';
import type { AppThemeMode } from '@/features/settings/composables/use-app-theme.js';

declare module 'vue-router' {
	interface RouteMeta {
		metaThemeColor?: string;
		metaThemeColors?: Record<AppThemeMode, string>;
		title?: string | { messageKey: string, namedProperties?: Record<string, unknown> };
		usePuzzleKey?: boolean;
		prev?: RouteLocationNormalized | null;
	}
}

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
							title: { messageKey: 'PageTitle.Statistics' }
						}
					},
					{
						path: 'history',
						name: 'StatisticsHistory',
						component: () => import('../views/StatisticsPuzzleHistoryPage.vue'),
						meta: {
							title: { messageKey: 'PageTitle.StatisticsPuzzleHistory' }
						}
					}
				]
			},
			{
				path: '/settings',
				name: 'Settings',
				component: SettingsPage,
				meta: {
					title: { messageKey: 'PageTitle.Settings' }
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
					title: { messageKey: 'PageTitle.Tools' }
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
			title: { messageKey: 'PageTitle.HowToPlay' }
		},
		children: [
			{
				path: '',
				name: 'HowToPlayOverview',
				component: () => import('@/features/how-to-play/components/tabs/HowToPlayOverview.vue'),
			},
			{
				path: 'rules',
				name: 'PuzzleRulesInfo',
				component: () => import('@/features/how-to-play/components/tabs/PuzzleRulesInfo.vue'),
			},
			{
				path: 'techniques',
				name: 'BasicTechniques',
				component: () => import('@/features/how-to-play/components/tabs/BasicTechniques.vue'),
			},
			{
				path: 'advanced',
				name: 'AdvancedTechniques',
				component: () => import('@/features/how-to-play/components/tabs/AdvancedTechniques.vue')
			}
		]
	},
	{
		path: '/help/tutorial',
		name: 'Tutorial',
		component: TutorialPage,
		meta: {
			title: { messageKey: 'PageTitle.Tutorial' }
		}
	},
	{
		path: '/play',
		component: FreePlay,
		name: 'NewPuzzleFreePlay',
		meta: {
			title: { messageKey: 'PageTitle.NewPuzzle' }
		}
	},
	{
		path: '/puzzle',
		component: PlayPuzzle,
		name: 'PlayPuzzle',
		meta: {
			title: { messageKey: 'PageTitle.PlayPuzzle' },
			usePuzzleKey: true,
		},
		beforeEnter: () => {
			const puzzleStatusStore = usePuzzleStatusStore();

			if (puzzleStatusStore.initialized) {
				return true;
			}
			// Not initialized here, so check if there is a saved puzzle. If so, we can continue as well and let the route component itself handle loading it
			const { hasCurrentSavedGame } = useSavedPuzzle();
			if (hasCurrentSavedGame.value) {
				return true;
			}
			console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
			return { name: 'NewPuzzleFreePlay', replace: true };
		},
		children: [
			{
				path: 'settings',
				name: 'PlayPuzzle.settings',
				component: SettingsPage,
				meta: {
					title: { messageKey: 'PageTitle.PlayPuzzleSettings' }
				}
			}
		]
	},
	{
		path: '/editor',
		component: () => import('../views/PuzzleInput.vue'),
		name: 'PuzzleInput',
		meta: {
			title: { messageKey: 'PageTitle.PuzzleEditor' }
		}
	},
	{
		path: '/line-completions',
		component: () => import('../views/LineCompletionsToolPage.vue'),
		name: 'LineCompletionsTool',
		meta: {
			title: 'Line Completions'
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

router.isReady().then(() => {
	document.querySelector('html')!.setAttribute('lang', i18n.global.locale.value);
})

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