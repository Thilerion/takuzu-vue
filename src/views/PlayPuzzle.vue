<template>
<div
	class="play-puzzle fixed box-border overflow-auto inset-0 max-h-vh flex flex-col z-20 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white"
	:class="{ 'puzzle-paused': paused, 'puzzle-finished': finished }"
>
	<GameBoardHeader
		@close="exitGame"
		@dropdown-toggled="onDropdownToggled"
		@pause="manualPauseGame"
		@resume="manualResumeGame"
	/>
	<GameBoardWrapper
		v-slot="{ width, height, cellSize }"
		:ruler-height="rulerSize"
		:ruler-width="rulerSize"
		:info-height="21"
		:padding-x="4"
		:padding-y="6"
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
			<template #puzzle-info>
				<PuzzleInfo
					:show-timer="showTimer"
					:difficulty="(difficulty as DifficultyKey)"
					:progress-ratio="puzzleStore.progress"
					:has-border="showRulers"
					:puzzle-paused="puzzleStore.paused"
				/>
			</template>
			<template #ruler-rows>
				<PuzzleRuler
					:cell-size="cellSize"
					:line-ids="board.rowIds"
					ruler-line-type="rows"
					:count-type="rulerCountType"
					:component-type="rulerComponentType"
				/>
			</template>
			<template #ruler-columns>
				<PuzzleRuler
					:cell-size="cellSize"
					:line-ids="board.columnIds"
					ruler-line-type="columns"
					:count-type="rulerCountType"
					:component-type="rulerComponentType"
				/>
			</template>
		</GameBoard>
	</GameBoardWrapper>

	<div class="footer2 h-32 w-full relative">
		<PuzzleControls
			:can-undo="puzzleHistoryStore.canUndo"
			:can-restart="puzzleStore.canRestart"
			:paused="paused"
			@undo="puzzleStore.undoLastMove"
			@restart="puzzleStore.restartPuzzle"
			@check="puzzleValidationStore.userCheck"
			@get-hint="puzzleHintsStore.getHint"
		/>
		<PuzzleHintWrapper />
	</div>

	<router-view v-slot="{ Component }">
		<OverlayPageTransition :show="Component != null">
			<div class="fixed inset-0 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white overflow-y-auto pb-8 z-40">
				<component :is="Component" />
			</div>
		</OverlayPageTransition>
	</router-view>

	<PuzzleRecap :show="finished && puzzleRecapStore.modalShown" />
</div>
</template>

<script setup lang="ts">
import { usePuzzleWakeLock } from '@/composables/use-wake-lock.js';
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from 'vue-router';
import type { DifficultyKey } from '@/lib/types.js';
import { useGoBackOrReplaceTo } from '@/router/useGoBackOrReplaceTo.js';
import { usePuzzlePauseResume } from '@/stores/puzzle/usePuzzlePauseResume.js';
import { usePuzzleHistoryStore } from '@/stores/puzzle-history/history-store.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { usePuzzleHintsStore } from '@/features/hints/store.js';
import { usePlayPuzzleUiStateStore } from '@/stores/puzzle/play-ui-state-store.js';
import { usePlayPuzzleSaveHandler } from './usePlayPuzzleSaveHandler.js';
import { usePlayPuzzleAutoPause } from './usePlayPuzzleAutoPause.js';
import { useGameCompletion } from './usePlayPuzzleCompletion.js';
import { usePuzzlePlayHotkeys } from '@/components/gameboard/composables/usePuzzlePlayHotkeys.js';
import { useSettingsStore } from '@/features/settings/store.js';
import { usePuzzleRecapStore } from '@/features/recap/store.js';
import { usePuzzleValidationStore } from '@/stores/assistance/validation.js';

const puzzleUiStateStore = usePlayPuzzleUiStateStore();
const { 
	windowHidden,
	
	puzzleUiHasOverlay,
	puzzleUiActive,

	showRulers,
	rulerComponentType,
	rulerCountType,
	rulerSize,
	showTimer,
} = storeToRefs(puzzleUiStateStore);
const {
	setDropdownOpen: onDropdownToggled,
	setSettingsOpen,
} = puzzleUiStateStore;

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
	{ windowHidden, puzzleUiHasOverlay, userIdle },
	{ autoResumeDelay: 250 }
);
const { manualPauseGame, manualResumeGame, toggleManualPause } = usePuzzlePauseResume();

// Setup watchers for puzzle completion
const { clearCompletionCheckTimeouts } = useGameCompletion();

// initialize required stores and router
const puzzleRecapStore = usePuzzleRecapStore();
const puzzleHistoryStore = usePuzzleHistoryStore();
const puzzleHintsStore = usePuzzleHintsStore();
const puzzleValidationStore = usePuzzleValidationStore();
const puzzleStore = usePuzzleStore();
const router = useRouter();

const {
	board, initialized, started, paused, finished, status: puzzlePlayStatus,
	height: rows, width: columns,
	difficulty
} = storeToRefs(puzzleStore);

// Whether the puzzle is active and being played: the puzzle ui is shown, and the puzzle is loaded and not paused/finished/etc
const puzzlePlayActive = computed((): boolean => {
	return puzzleUiActive.value && puzzlePlayStatus.value === 'playing';
})
usePuzzlePlayHotkeys({
	undo: () => {
		if (!puzzlePlayActive.value) return;
		if (puzzleHistoryStore.canUndo) puzzleStore.undoLastMove();
	},
	check: () => {
		if (!puzzlePlayActive.value) return;
		const settingsStore = useSettingsStore();
		if (settingsStore.checkButtonEnabled) {
			usePuzzleValidationStore().userCheck();
		}
	},
	togglePause: () => {
		// Check if puzzle ui is active, because otherwise the puzzle can be manually paused while the dropdown menu or settings are open
		// However, "puzzlePlayActive" also checks if not paused, so that can't be used here
		if (!puzzleUiActive.value) return;
		toggleManualPause();
	},
	resumePlay: () => {
		if (!puzzleUiActive.value) return;
		manualResumeGame();
	},
	getHint: () => {
		if (!puzzlePlayActive.value) return;
		if (!puzzleHintsStore.isHintShown) puzzleHintsStore.getHint();
	},
	hideHint: () => {
		if (!puzzlePlayActive.value) return;
		if (puzzleHintsStore.isHintShown) puzzleHintsStore.hide();
	}
});

const startGame = () => {
	if (!initialized.value) {
		// console.warn('Cannot start puzzle that is not initialized');
		return;
	}
	if (started.value) {
		// console.warn('Cannot start puzzle that is already started!');
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
onBeforeRouteLeave(() => {
	puzzleStore.reset();
})

onBeforeRouteUpdate((to) => {
	const toName = to?.name;
	const settingsShouldBeOpen = typeof toName === 'string' && toName.toLowerCase().includes('settings');
	setSettingsOpen(settingsShouldBeOpen);
})
</script>