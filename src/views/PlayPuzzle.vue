<template>
	<div class="play-puzzle fixed box-border overflow-auto inset-0 flex flex-col z-20 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white" :class="{'puzzle-paused': paused, 'puzzle-finished': finished }">
		<GameBoardHeader
			class="flex-shrink-0"
			@close="exitGame"
			@dropdown-toggled="dropdownToggled"
			:rows="rows"
			:columns="columns"	
		/>
		<GameBoardWrapper
			:ruler-height="rulerSize"
			:ruler-width="rulerSize"
			:info-height="'21px'"
			:rows="rows"
			:columns="columns"
			v-slot="{width, height, cellSize}"
		>
			<GameBoard
				v-if="started && board"
				:paused="paused"
				:rows="rows"
				:columns="columns"
				:board="board"
				:grid-height="height"
				:grid-width="width"
				:cell-size="cellSize"			
				@pointerdown.once="checkEnableWakeLock"
			>
				<template v-slot:puzzle-info>
					<PuzzleInfo
						:show-timer="showTimer"
						:difficulty="difficulty"
						:progress="progress"
						:has-border="showRulers"
					/>
				</template>
				<template v-slot:ruler-rows>
					<RulerCoords @select-line="selectLine" v-if="rulerType === 'coords'" line-type="rows" :line-ids="board.rowIds" />
					<RulerCounts @select-line="selectLine" v-else-if="showRulers" line-type="rows" :ruler-type="rulerType" :counts="rowCounts" />
				</template>
				<template v-slot:ruler-columns>
					<RulerCoords @select-line="selectLine" v-if="rulerType === 'coords'" line-type="columns" :line-ids="board.columnIds" />
					<RulerCounts @select-line="selectLine" v-else-if="showRulers" line-type="columns" :ruler-type="rulerType" :counts="columnCounts" />
				</template>
			</GameBoard>
		</GameBoardWrapper>
		
		<div class="footer2 h-24 w-full relative">
			<PuzzleControls
				:can-undo="canUndo"
				:paused="paused"
				@undo="undo"
				@restart="restart"
				@check="checkErrors"
				@get-hint="getHint"
			/>
			<PuzzleHintWrapper />
		</div>

		<router-view v-slot="{ Component }">
			<OverlayPageTransition>
				<div v-if="Component" class="fixed inset-0 bg-gray-50 overflow-y-auto pb-8 z-40">
					<component :is="Component" />
				</div>
			</OverlayPageTransition>
		</router-view>

		<teleport to="#overlay-container">
			<PuzzleFinishedModal @exit-game="exitGame" :finished="finished" />
		</teleport>
	</div>
</template>

<script>
import store from '@/store/index.js';
import { mapGetters, mapState } from 'vuex';

import GameBoard from '@/components/gameboard/GameBoard.vue';
import GameBoardHeader from '@/components/gameboard/GameBoardHeader.vue';
import GameBoardWrapper from '@/components/gameboard/GameBoardWrapper.vue';
import PuzzleControls from '@/components/gameboard/PuzzleControls.vue';
import PuzzleInfo from '@/components/gameboard/PuzzleInfo.vue';
import RulerCoords from '@/components/gameboard/RulerCoords.vue';
import RulerCounts from '@/components/gameboard/RulerCounts.vue';
import OverlayPageTransition from '@/views/transitions/OverlayPageTransition.vue';
import PuzzleFinishedModal from '@/components/gameboard/PuzzleRecapTransition.vue';
import PuzzleHintWrapper from '@/components/gameboard/PuzzleHintWrapper.vue';

import { hasCurrentSavedGame } from '@/services/save-game.js';
import { usePageVisibility } from '@/composables/use-page-visibility.js';
import WakeLock from '../services/wake-lock.js';
const wakeLock = new WakeLock();

import { COLUMN, ROW } from '@/lib/constants.js';

import debounce from 'lodash.debounce';
import { useSettingsStore } from '@/stores/settings.js';
import { storeToRefs } from 'pinia';
import { useBasicStatsStore } from '@/stores/basic-stats.js';
import { usePuzzleHistoryStore } from '@/stores/puzzle-history.js';
import { usePuzzleHintsStore } from '@/stores/puzzle-hinter.js';

export default {
	components: {
		GameBoard,
		GameBoardHeader,
		GameBoardWrapper,
		PuzzleControls,
		PuzzleInfo,
		RulerCoords,
		RulerCounts,
		OverlayPageTransition,
		PuzzleFinishedModal,
		PuzzleHintWrapper,
	},
	setup() {
		const { hidden } = usePageVisibility();

		const settingsStore = useSettingsStore();

		const { showLineInfo, enableWakeLock, showBoardCoordinates, showBoardLineCounts, showRulers, showTimer } = storeToRefs(settingsStore);

		const basicStatsStore = useBasicStatsStore();
		const puzzleHistoryStore = usePuzzleHistoryStore();
		const puzzleHintsStore = usePuzzleHintsStore();
		const getHint = () => puzzleHintsStore.getHint();

		return { 
			windowHidden: hidden,
			showLineInfo, showBoardCoordinates, showBoardLineCounts, showRulers,
			shouldEnableWakeLock: enableWakeLock, showTimer,
			basicStatsStore, puzzleHistoryStore, getHint
		};
	},
	data() {
		return {
			finishedTimeout: null,
			mistakeCheckTimeout: null,
			autoSaveInterval: null,
			
			rowKey: ROW,
			columnKey: COLUMN,

			dropdownOpen: false,
			settingsOpen: false,

			wakeLock: wakeLock,
			isWakeLockEnabled: false,

			selectedLine: null
		}
	},
	computed: {
		...mapState('puzzle', [
			'board', 'initialBoard',
			'difficulty',
			'initialized', 'started', 'paused', 'finished',
		]),
		...mapState('puzzle', {
			rows: state => state.height,
			columns: state => state.width,
			rowCounts: state => state.rowCounts,
			columnCounts: state => state.colCounts,
		}),
		puzzleKey() {
			return this.$store.state.puzzleKey;
		},
		displayCounts() {
			if (this.rulerType === 'count-remaining') return this.remainingCounts;
			if (this.rulerType === 'count-current') return this.currentCounts;
			return {};
		},
		rulerSize() {
			if (this.showBoardCoordinates) {
				return '16px';
			} else if (this.showBoardLineCounts) {
				return 'cellSize';
			} else return '0px';
		},
		rulerType() {
			if (this.showBoardCoordinates) return 'coords';
			if (this.showLineInfo === 'remainingCount') return 'count-remaining';
			if (this.showLineInfo === 'currentCount') return 'count-current';
			return null;
		},
		progress() {
			const base = this.$store.getters['puzzle/progress'];
			const rounded = Math.ceil(base * 100);
			// prevent progress from being 100 when not every cell is filled
			if (rounded == 100 && base < 1) return 99;
			return rounded;
		},
		canUndo() {
			return this.puzzleHistoryStore.canUndo;
		},
		finishedAndSolved() {
			return this.$store.getters['puzzle/finishedAndSolved'];
		},
		finishedWithMistakes() {
			return this.$store.getters['puzzle/finishedWithMistakes'];
		},
		boardGrid() {
			return this.board?.grid;
		},
		puzzleShouldBePaused() {
			return this.settingsOpen || this.dropdownOpen || this.windowHidden;
		}
	},
	methods: {
		selectLine(value) {
			if (!value) {
				this.selectedLine = null;
			} else {
				const { type, index } = value;
				this.selectedLine = { type, index };
			}
		},
		startGame() {
			if (!this.initialized) {
				console.warn('Cannot start puzzle that is not initialized');
				return;
			}
			if (this.started) {
				console.warn('Cannot start puzzle that is already started!');
				return;
			}
			this.$store.dispatch('puzzle/startPuzzle');
		},
		exitGame() {
			if (this.canSaveGame()) {
				this.saveGame();
			}
			const metaFrom = this.$route.meta.prev;
			if (metaFrom == null) {
				this.$router.replace({ name: 'FreePlay' });
			} else {
				this.$router.go(-1);
			}
		},
		settingsToggled(value) {
			this.settingsOpen = value;
		},
		dropdownToggled(value) {
			this.dropdownOpen = value;
		},
		async finishGame() {
			// window.alert('Good job! You finished this puzzle.');
			const historyEntry = await this.$store.dispatch('puzzle/finishPuzzle');
			await this.basicStatsStore.getGameEndStats(historyEntry);
		},
		undo() {
			this.$store.dispatch('puzzle/undoLastMove');
		},
		restart() {
			this.$store.dispatch('puzzle/restartPuzzle');
		},
		canSaveGame() {
			return this.initialized && this.started && !this.finished && !!this.boardGrid;
		},
		saveGame() {
			if (this.canSaveGame()) {
				this.$store.dispatch('puzzle/savePuzzle');
			}
		},
		initAutoSave() {
			// console.log('init auto save');
			this.autoSaveInterval = setInterval(() => {
				this.saveGame();
			}, 1500);
		},
		stopAutoSave() {
			// console.log('stop auto save');
			clearInterval(this.autoSaveInterval);
			this.autoSaveInterval = null;
		},
		checkErrors() {
			const boardStr = this.$store.getters['puzzle/boardStr'];
			this.$store.dispatch('puzzle/assistance/userCheckErrors', boardStr);
		},
		checkEnableWakeLock() {
			const setting = this.shouldEnableWakeLock;

			if (setting) {
				this.wakeLock.enable();
				this.isWakeLockEnabled = this.wakeLock.enabled;
				this.wakeLock.onChange = (isEnabled) => {
					this.isWakeLockEnabled = !!isEnabled;
				}
			}
		}
	},
	created() {
		this.debouncedPause = debounce((value) => {
			this.$store.dispatch('puzzle/pauseGame', value);
		}, 150);
	},
	mounted() {
		this.startGame();
		this.initAutoSave();
	},
	beforeMount() {
		if (!this.$store.state.puzzle.initialized) {
			if (hasCurrentSavedGame()) {
				this.$store.dispatch('puzzle/loadSavedPuzzle');
				return;
			}
			console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
			this.$router.replace({ name: 'FreePlay' });
		}
	},
	beforeRouteEnter(to, from, next) {
		if (!store.state.puzzle.initialized) {
			if (hasCurrentSavedGame()) {
				store.dispatch('puzzle/loadSavedPuzzle');
				return next();
			}
			console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
			return next({ name: 'FreePlay', replace: true });
		}
		next();
	},
	beforeRouteLeave(to, from, next) {
		const toName = to.name;
		const prevName = from.meta?.prev?.name;
		this.$store.dispatch('puzzle/reset');
		if (toName === prevName && toName === 'MainMenu') {
			return next({ name: 'FreePlay' });
		}
		next();
	},
	beforeRouteUpdate(to, from, next) {
		if (to.name.includes('settings')) this.settingsOpen = true;
		else this.settingsOpen = false;
		next();
	},
	beforeUnmount() {
		if (this.canSaveGame()) {
			this.saveGame();
		}
		this.stopAutoSave();

		clearTimeout(this.finishedTimeout);
		clearTimeout(this.mistakeCheckTimeout);
	},
	unmounted() {
		// TODO: also stop wake lock when game is paused, settings is open, etc, and enable it again when resuming
		this.wakeLock.destroy();
	},
	watch: {
		finishedAndSolved: {
			handler(newValue, prevValue) {
				if (newValue) {
					this.finishedTimeout = setTimeout(() => {
						this.finishGame();
						this.finishedTimeout = null;
					}, 600);
				} else if (prevValue && !newValue) {
					// no longer correct
					clearTimeout(this.finishedTimeout);
					this.finishedTimeout = null;
				}
			}
		},
		finishedWithMistakes: {
			handler(newValue) {
				if (newValue) {
					this.mistakeCheckTimeout = setTimeout(() => {
						this.mistakeCheckTimeout = null;
						if (!this.finishedWithMistakes) {
							return;
						}
						this.$store.dispatch('puzzle/assistance/autoCheckFinishedWithMistakes');
					}, 2000);
				} else {
					clearTimeout(this.mistakeCheckTimeout);
					this.mistakeCheckTimeout = null;
				}
			}
		},
		puzzleShouldBePaused(newValue, prevValue) {
			setTimeout(() => {
				if (newValue && !prevValue) {
					// immediately pause
					this.debouncedPause(true);
					this.debouncedPause.flush();
				} else if (!newValue && prevValue) {
					// but have a small delay when resuming
					this.debouncedPause(false);
				}
			}, 1000 / 30);
		},
	}
};
</script>

<style scoped>
.play-puzzle {
	--bg-a: theme(colors.slate.50);
	--bg-b: theme(colors.white);
	background: linear-gradient(180deg, var(--bg-a) 0%, var(--bg-a) 15%, var(--bg-b) 90%, var(--bg-b) 100%);
}

.inset-0 {
	max-height: var(--vh-total);
}

.old-board {
	display: inline-grid;
	font-size: var(--cell-font-size);
	gap: var(--grid-gap);

	grid-template-rows: var(--line-helper-size) repeat(var(--board-rows), 1fr) 0px;
	grid-template-columns: var(--line-helper-size) repeat(var(--board-cols), 1fr) 0px;
}
</style>