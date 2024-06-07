<template>
<PuzzlePlayLayout
	:data-play-state="dataPlayStateAttribute"
	game-area-classes="px-1 py-2"
	:game-area-size-config="{
		rulerSize,
		paddingX: 0, paddingY: 0,
		infobarHeight: 21
	}"
	:show-recap="finished && puzzleRecapStore.modalShown"
>
	<template #header>
		<PuzzlePlayHeader
			@save="saveGame"
			@exit="goBackToNewPuzzleRoute"
		/>
	</template>
	
	<template #gameboard="{ gridHeight, gridWidth, cellSize }">
		<GameBoard
			v-if="started && board"
			:paused="paused"
			:rows="rows!"
			:columns="columns!"
			:board="board"
			:grid-height="gridHeight"
			:grid-width="gridWidth"
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
	</template>

	<template #footer>
		<PuzzlePlayFooter />
	</template>
</PuzzlePlayLayout>
</template>

<script setup lang="ts">
import { usePuzzleWakeLock } from '@/composables/use-wake-lock.js';
import { storeToRefs } from 'pinia';
import { computed, onUnmounted, onBeforeUnmount, onMounted } from 'vue';
import { onBeforeRouteUpdate, useRouter } from 'vue-router';
import type { DifficultyKey } from '@/lib/types.js';
import { useGoBackOrReplaceTo } from '@/router/useGoBackOrReplaceTo.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { usePlayPuzzleUiStateStore } from '@/stores/puzzle/play-ui-state-store.js';
import { usePlayPuzzleSaveHandler } from './usePlayPuzzleSaveHandler.js';
import { usePlayPuzzleAutoPause } from './usePlayPuzzleAutoPause.js';
import { useGameCompletion } from './usePlayPuzzleCompletion.js';
import { usePuzzleRecapStore } from '@/features/recap/store.js';
import { usePuzzlePlayHotkeys, usePuzzlePlayHotkeyCallbacks } from '@/features/puzzle-play/composables/puzzle-play-hotkeys.js';

const puzzleUiStateStore = usePlayPuzzleUiStateStore();
const { 
	windowHidden,	
	puzzleUiHasOverlay, puzzleUiActive,
	showRulers, rulerComponentType, rulerCountType, rulerSize,
	showTimer,
} = storeToRefs(puzzleUiStateStore);
const {
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

// Setup watchers for puzzle completion
const { cleanup: cleanupCompletionChecker } = useGameCompletion();

// Initialize required stores and router
const puzzleRecapStore = usePuzzleRecapStore();
const puzzleStore = usePuzzleStore();
const router = useRouter();

const {
	board, initialized, started, paused, finished, status: puzzlePlayStatus,
	height: rows, width: columns,
	difficulty
} = storeToRefs(puzzleStore);

// Data attribute on HTML element for play-state
const dataPlayStateAttribute = computed(() => {
	if (paused.value) return 'paused';
	if (finished.value) return 'finished';
	return 'playing';
})

// Initialize hotkeys for actions such as undo, check, pause, resume, get/hide hint
usePuzzlePlayHotkeys(usePuzzlePlayHotkeyCallbacks(
	puzzlePlayStatus,
	puzzleUiActive
));

const startGame = () => {
	// Can only start the game when it has not yet started. A puzzle should be initialized before it can be started.
	if (!initialized.value || started.value) {
		return;
	}
	puzzleStore.startPuzzle();
}

const goBackToNewPuzzleRoute = useGoBackOrReplaceTo({ name: 'NewPuzzleFreePlay' });

// MOUNT/UNMOUNT HANDLERS
// When the page is loaded, check if there is a puzzle loaded in store. If not, try to load the saved puzzle, else redirect to a new puzzle route.
if (!initialized.value) {
	if (hasCurrentSavedGame.value) {
		puzzleStore.loadSavedPuzzle();
	} else {
		console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
		router.replace({ name: 'NewPuzzleFreePlay' });
	}
}
onMounted(() => {
	startGame();
	initAutoSave();
})
onBeforeUnmount(() => {
	if (puzzlePlayStatus.value === 'none') {
		console.error('PlayPuzzle unmounts, but puzzleStore is already reset. So cannot save game. Should reset puzzleStore only after this.');
	}
	saveGame();
	stopAutoSave();
	cleanupCompletionChecker();
})
onUnmounted(() => {
	puzzleStore.reset();
})

// Watch if the route changes to include "settings", and if so, set settings open so another component can load it.
onBeforeRouteUpdate((to) => {
	const toName = to?.name;
	const settingsShouldBeOpen = typeof toName === 'string' && toName.toLowerCase().includes('settings');
	setSettingsOpen(settingsShouldBeOpen);
})
</script>