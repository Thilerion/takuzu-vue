<template>
	<div class="play-puzzle fixed box-border overflow-auto inset-0 flex flex-col z-20 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white" :class="{'puzzle-paused': paused, 'puzzle-finished': finished }">
		<GameBoardHeader
			@close="exitGame"
			@dropdown-toggled="dropdownToggled"	
			@pause="pause"
			@resume="resume"
		/>
		<GameBoardWrapper
			:ruler-height="rulerSize"
			:ruler-width="rulerSize"
			:info-height="'21px'"
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
				<div v-if="Component" class="fixed inset-0 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white overflow-y-auto pb-8 z-40">
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

import { usePuzzleWakeLock } from '@/composables/use-wake-lock.js';

import { COLUMN, ROW } from '@/lib/constants.js';

import debounce from 'lodash.debounce';
import { useSettingsStore } from '@/stores/settings.js';
import { storeToRefs, mapState } from 'pinia';
import { useBasicStatsStore } from '@/stores/basic-stats.js';
import { usePuzzleHistoryStore } from '@/stores/puzzle-history.js';
import { usePuzzleHintsStore } from '@/stores/puzzle-hinter.js';
import { usePuzzleMistakesStore } from '@/stores/puzzle-mistakes.js';
import { computed, readonly, ref, toRef } from 'vue';
import { useSavedPuzzle } from '@/services/useSavedPuzzle.js';
import { usePuzzleStore } from '@/stores/puzzle.js';
import { useAppStore } from '@/stores/app.js';

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
		const settingsStore = useSettingsStore();

		const { showLineInfo, enableWakeLock, showBoardCoordinates, showBoardLineCounts, showRulers, showTimer } = storeToRefs(settingsStore);

		const basicStatsStore = useBasicStatsStore();
		const puzzleHistoryStore = usePuzzleHistoryStore();
		const puzzleHintsStore = usePuzzleHintsStore();
		const getHint = () => puzzleHintsStore.getHint();
		const puzzleMistakesStore = usePuzzleMistakesStore();

		const wakeLock = usePuzzleWakeLock();

		const { hasCurrentSavedGame } = useSavedPuzzle();

		const puzzleStore = usePuzzleStore();

		const pausedByUser = readonly(toRef(puzzleStore, 'pausedByUser'));
		const pause = () => {
			puzzleStore.setPaused(true, { userAction: true });
		}
		const resume = () => {
			puzzleStore.setPaused(false, { userAction: true });
		}

		const mainStore = useAppStore();
		const windowHidden = toRef(mainStore, 'windowHidden');

		return { 
			windowHidden,
			showLineInfo, showBoardCoordinates, showBoardLineCounts, showRulers,
			isWakeLockEnabled: computed(() => wakeLock.isActive.value),
			shouldEnableWakeLock: enableWakeLock, showTimer,
			basicStatsStore, puzzleHistoryStore, getHint,
			userCheckErrors: (boardStr) => puzzleMistakesStore.userCheckErrors(boardStr),
			autoCheckErrors: () => puzzleMistakesStore.autoCheckFinishedWithMistakes(),
			wakeLock,
			hasCurrentSavedGame,
			puzzleStore, pause, resume, pausedByUser
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

			selectedLine: null
		}
	},
	computed: {
		...mapState(usePuzzleStore, [
			'board', 'initialBoard',
			'difficulty',
			'initialized', 'started', 'paused', 'finished',
		]),
		...mapState(usePuzzleStore, {
			rows: 'height',
			columns: 'width',
			rowCounts: 'rowCounts',
			columnCounts: 'colCounts',
		}),
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
			const base = this.puzzleStore.progress;
			const rounded = Math.ceil(base * 100);
			// prevent progress from being 100 when not every cell is filled
			if (rounded == 100 && base < 1) return 99;
			return rounded;
		},
		canUndo() {
			return this.puzzleHistoryStore.canUndo;
		},
		finishedAndSolved() {
			return this.puzzleStore.finishedAndSolved;
					},
		finishedWithMistakes() {
			return this.puzzleStore.finishedWithMistakes;
		},
		boardGrid() {
			return this.board?.grid;
		},
		puzzleShouldBePaused() {
			return this.pausedByUser || this.settingsOpen || this.dropdownOpen || this.windowHidden;
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
			this.puzzleStore.startPuzzle();
		},
		exitGame() {
			if (this.canSaveGame()) {
				this.saveGame();
			}
			const metaFrom = this.$route.meta.prev;
			if (metaFrom == null) {
				this.$router.replace({ name: 'NewPuzzleFreePlay' });
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
			const historyEntry = await this.puzzleStore.finishPuzzle();
			await this.basicStatsStore.getGameEndStats(historyEntry);
		},
		undo() {
			this.puzzleStore.undoLastMove();
		},
		restart() {
			this.puzzleStore.restartPuzzle();
		},
		canSaveGame() {
			return this.initialized && this.started && !this.finished && !!this.boardGrid;
		},
		saveGame() {
			if (this.canSaveGame()) {
				this.puzzleStore.savePuzzle();
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
			const boardStr = this.puzzleStore.boardStr;
			this.userCheckErrors(boardStr);
		},
		checkEnableWakeLock() {
			console.log(this.wakeLock.isActive.value);
			if (this.wakeLock.isActive.value) {
				return;
			}
			const setting = this.shouldEnableWakeLock;

			if (setting) {
				this.wakeLock.request();
			}
		}
	},
	created() {
		this.debouncedPause = debounce((value) => {
			this.puzzleStore.pauseGame(value);
		}, 150);
	},
	mounted() {
		this.startGame();
		this.initAutoSave();
	},
	beforeMount() {
		const puzzleStore = usePuzzleStore();
		if (!puzzleStore.initialized) {
			if (this.hasCurrentSavedGame.value) {
				this.puzzleStore.loadSavedPuzzle();
				return;
			}
			console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
			this.$router.replace({ name: 'NewPuzzleFreePlay' });
		}
	},
	beforeRouteEnter(to, from, next) {
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
	beforeRouteLeave(to, from, next) {
		const toName = to.name;
		const prevName = from.meta?.prev?.name;
		this.puzzleStore.reset();
		if (toName === prevName && toName === 'Home') {
			return next({ name: 'NewPuzzleFreePlay' });
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
		this.wakeLock.release();
		// this.wakeLock.destroy();
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
						this.autoCheckErrors();
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