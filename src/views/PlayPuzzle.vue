<template>
	<div class="play-puzzle fixed box-border overflow-auto inset-0 flex flex-col z-20 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white"
		:class="{ 'puzzle-paused': paused, 'puzzle-finished': finished }">
		<GameBoardHeader
			@close="exitGame"
			@dropdown-toggled="onDropdownToggled"
			@pause="manualPauseGame"
			@resume="manualResumeGame"
		/>
		<GameBoardWrapper
			:ruler-height="rulerSize"
			:ruler-width="rulerSize"
			:info-height="21"
			:padding-x="4"
			:padding-y="6"
			v-slot="{ width, height, cellSize }"
		>
			<GameBoard
				v-if="started && board"
				:paused="paused"
				:rows="rows!"
				:columns="columns!"
				:board="board"
				:grid-height="height"
				:grid-width="width"
				:cell-size="cellSize"
			>
				<template v-slot:puzzle-info>
					<PuzzleInfo
						:show-timer="showTimer"
						:difficulty="(difficulty as DifficultyKey)"
						:progress-ratio="puzzleStore.progress"
						:has-border="showRulers"
						:puzzle-paused="puzzleStore.paused"
					/>
				</template>
				<template v-slot:ruler-rows>
					<CoordsRuler 
						v-if="rulerComponentType === 'coords'"
						line-type="rows"
						:line-ids="board.rowIds"
					/>
					<CountsRuler
						v-else-if="rulerComponentType === 'count'"
						:count-type="rulerCountType!"
						line-type="rows"
						:cell-size="cellSize"
					/>
				</template>
				<template v-slot:ruler-columns>
					<CoordsRuler
						v-if="rulerComponentType === 'coords'"
						line-type="columns"
						:line-ids="board.columnIds"
					/>
					<CountsRuler
						v-else-if="rulerComponentType === 'count'"
						:count-type="rulerCountType!"
						line-type="columns"
						:cell-size="cellSize"
					/>
				</template>
			</GameBoard>
		</GameBoardWrapper>

		<div class="footer2 h-32 w-full relative">
			<PuzzleControls
				:can-undo="puzzleHistoryStore.canUndo"
				:paused="paused"
				@undo="puzzleStore.undoLastMove"
				@restart="puzzleStore.restartPuzzle"
				@check="puzzleAssistanceStore.userCheck"
				@get-hint="puzzleHintsStore.getHint"
			/>
			<PuzzleHintWrapper />
		</div>

		<router-view v-slot="{ Component }">
			<OverlayPageTransition :show="Component != null">
				<div
					class="fixed inset-0 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white overflow-y-auto pb-8 z-40">
					<component :is="Component" />
				</div>
			</OverlayPageTransition>
		</router-view>

		<PuzzleRecap :show="finished && recapStatsStore.modalShown" />
	</div>
</template>

<script setup lang="ts">
import GameBoard from '@/components/gameboard/GameBoard.vue';
import GameBoardHeader from '@/components/gameboard/GameBoardHeader.vue';
import GameBoardWrapper from '@/components/gameboard/GameBoardWrapper.vue';
import PuzzleControls from '@/components/gameboard/PuzzleControls.vue';
import PuzzleInfo from '@/components/gameboard/PuzzleInfo.vue';
import OverlayPageTransition from '@/views/transitions/OverlayPageTransition.vue';
import PuzzleHintWrapper from '@/components/gameboard/hints/PuzzleHintWrapper.vue';
import PuzzleRecap from '@/components/puzzle-recap/PuzzleRecap.vue';
import CountsRuler from '@/components/gameboard/ruler/CountsRuler.vue';
import CoordsRuler from '@/components/gameboard/ruler/CoordsRuler.vue';

import { usePuzzleWakeLock } from '@/composables/use-wake-lock';
import { storeToRefs } from 'pinia';
import { onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { useRecapStatsStore } from '@/stores/recap-stats';
import { usePuzzleAssistanceStore } from '@/stores/assistance/store';
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from 'vue-router';
import type { DifficultyKey } from '@/lib/types.js';
import { useGoBackOrReplaceTo } from '@/router/useGoBackOrReplaceTo.js';
import { usePuzzlePauseResume } from '@/stores/puzzle/usePuzzlePauseResume.js';
import { usePuzzleHistoryStore } from '@/stores/puzzle/history-store.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { usePuzzleHintsStore } from '@/stores/hints/store.js';
import { usePlayPuzzleUiState } from './usePlayPuzzleUiState.js';
import { usePlayPuzzleSaveHandler } from './usePlayPuzzleSaveHandler.js';
import { usePlayPuzzleAutoPause } from './usePlayPuzzleAutoPause.js';
import { useGameCompletion } from './usePlayPuzzleCompletion.js';

const { 
	windowHidden,
	showRulers,
	rulerComponentType,
	rulerCountType,
	rulerSize,
	showTimer,
	onDropdownToggled,
	setSettingsOpen,

	dropdownOpen,
	settingsOpen,
} = usePlayPuzzleUiState();

const {
	hasCurrentSavedGame,
	saveGame,

	initAutoSave,
	stopAutoSave,
} = usePlayPuzzleSaveHandler();

// Start UsePuzzleWakeLock composable, immediately initializes wakeLock if enabled in settings.
const { idle: userIdle } = usePuzzleWakeLock();

// setup auto-pause and auto-resume watchers
usePlayPuzzleAutoPause(
	{ windowHidden, dropdownOpen, settingsOpen, userIdle },
	{ autoResumeDelay: 250 }
);
const { manualPauseGame, manualResumeGame } = usePuzzlePauseResume();

// Setup watchers for puzzle completion
const { clearCompletionCheckTimeouts } = useGameCompletion();

// initialize required stores and router
const recapStatsStore = useRecapStatsStore(); // should be initialized to keep state active until puzzle is finished
const puzzleHistoryStore = usePuzzleHistoryStore();
const puzzleHintsStore = usePuzzleHintsStore();
const puzzleAssistanceStore = usePuzzleAssistanceStore();
const puzzleStore = usePuzzleStore();
const router = useRouter();

const {
	board, initialized, started, paused, finished,
	height: rows, width: columns,
	difficulty
} = storeToRefs(puzzleStore);

const startGame = () => {
	if (!initialized.value) {
		console.warn('Cannot start puzzle that is not initialized');
		return;
	}
	if (started.value) {
		console.warn('Cannot start puzzle that is already started!');
		return;
	}
	puzzleStore.startPuzzle();
}

const goBackToNewPuzzleRoute = useGoBackOrReplaceTo({ name: 'NewPuzzleFreePlay' });
const exitGame = () => {
	saveGame();
	goBackToNewPuzzleRoute();
}

// MOUNT/UNMOUNT HANDLERS
onMounted(() => {
	startGame();
	initAutoSave();
})
onBeforeMount(() => {
	if (!initialized.value) {
		if (hasCurrentSavedGame.value) {
			puzzleStore.loadSavedPuzzle();
			return;
		}
		console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
		router.replace({ name: 'NewPuzzleFreePlay' });
	}
})
onBeforeUnmount(() => {
	saveGame();
	stopAutoSave();
	clearCompletionCheckTimeouts();
})

// NAVIGATION GUARDS
onBeforeRouteLeave((to, from, next) => {
	puzzleStore.reset();

	const toName = to.name;
	const prevName = from.meta?.prev?.name;
	if (toName === prevName && toName === 'Home') {
		return next({ name: 'NewPuzzleFreePlay' }); // TODO: comment, why?
	}
	next();
})

onBeforeRouteUpdate((to, from, next) => {
	const toName = to?.name;
	const settingsShouldBeOpen = typeof toName === 'string' && toName.toLowerCase().includes('settings');
	setSettingsOpen(settingsShouldBeOpen);
	next();
})
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