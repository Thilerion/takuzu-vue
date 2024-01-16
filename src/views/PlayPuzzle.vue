<template>
	<div class="play-puzzle fixed box-border overflow-auto inset-0 flex flex-col z-20 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white"
		:class="{ 'puzzle-paused': paused, 'puzzle-finished': finished }">
		<GameBoardHeader @close="exitGame" @dropdown-toggled="dropdownToggled" @pause="pause" @resume="resume" />
		<GameBoardWrapper :ruler-height="rulerSize" :ruler-width="rulerSize" :info-height="'21px'"
			v-slot="{ width, height, cellSize }">
			<GameBoard v-if="started && board" :paused="paused" :rows="rows" :columns="columns" :board="board"
				:grid-height="height" :grid-width="width" :cell-size="cellSize">
				<template v-slot:puzzle-info>
					<PuzzleInfo :show-timer="showTimer" :difficulty="difficulty" :progress="progress"
						:has-border="showRulers" />
				</template>
				<template v-slot:ruler-rows>
					<CoordsRuler v-if="rulerType === 'coords'" line-type="rows"
						:line-ids="board.rowIds" />
					<CountsRuler v-else-if="showRulers"
						:count-type="rulerType === 'count-remaining' ? 'remaining' : 'current'" line-type="rows"
						:counts="rowCounts" :cell-size="cellSize" />
				</template>
				<template v-slot:ruler-columns>
					<CoordsRuler v-if="rulerType === 'coords'" line-type="columns"
						:line-ids="board.columnIds" />
					<CountsRuler v-else-if="showRulers"
						:count-type="rulerType === 'count-remaining' ? 'remaining' : 'current'" line-type="columns"
						:counts="columnCounts" :cell-size="cellSize" />
				</template>
			</GameBoard>
		</GameBoardWrapper>

		<div class="footer2 h-32 w-full relative">
			<PuzzleControls :can-undo="canUndo" :paused="paused" @undo="undo" @restart="restart" @check="checkErrors"
				@get-hint="getHint" />
			<HintWrapper></HintWrapper>
		</div>

		<router-view v-slot="{ Component }">
			<OverlayPageTransition :show="Component != null">
				<div
					class="fixed inset-0 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white overflow-y-auto pb-8 z-40">
					<component :is="Component" />
				</div>
			</OverlayPageTransition>
		</router-view>

		<PuzzleRecap :finished="finished"></PuzzleRecap>
	</div>
</template>

<script setup lang="ts">
import GameBoard from '@/components/gameboard/GameBoard.vue';
import GameBoardHeader from '@/components/gameboard/GameBoardHeader.vue';
import GameBoardWrapper from '@/components/gameboard/GameBoardWrapper.vue';
import PuzzleControls from '@/components/gameboard/PuzzleControls.vue';
import PuzzleInfo from '@/components/gameboard/PuzzleInfo.vue';
import OverlayPageTransition from '@/views/transitions/OverlayPageTransition.vue';
import HintWrapper from '@/components/gameboard/hints/HintWrapper.vue';
import PuzzleRecap from '@/components/puzzle-recap/PuzzleRecap.vue';
import CountsRuler from '@/components/gameboard/ruler/CountsRuler.vue';
import CoordsRuler from '@/components/gameboard/ruler/CoordsRuler.vue';

import { usePuzzleWakeLock } from '@/composables/use-wake-lock';

import debounce from 'lodash.debounce';
import { useSettingsStore } from '@/stores/settings/store';
import { storeToRefs, mapState } from 'pinia';
import { usePuzzleHistoryStore } from '@/stores/puzzle-history';
import { usePuzzleHintsStore } from '@/stores/puzzle-hinter';
import { computed, readonly, toRef, watch } from 'vue';
import { useSavedPuzzle } from '@/services/savegame/useSavedGame';
import { usePuzzleStore } from '@/stores/puzzle';
import { useMainStore } from '@/stores/main';
import { useRecapStatsStore } from '@/stores/recap-stats';
import { rulerType as RULER_TYPE } from '@/stores/settings/options';
import { usePuzzleAssistanceStore } from '@/stores/assistance/store';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { onBeforeMount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { onBeforeRouteUpdate } from 'vue-router';
import { onBeforeUnmount } from 'vue';
import type { DifficultyKey } from '@/lib/types.js';

const settingsStore = useSettingsStore();

const { showLineInfo, showBoardCoordinates, showBoardLineCounts, showRulers, showTimer } = storeToRefs(settingsStore);

useRecapStatsStore();
const puzzleHistoryStore = usePuzzleHistoryStore();
const { canUndo } = storeToRefs(puzzleHistoryStore);
const puzzleHintsStore = usePuzzleHintsStore();
const getHint = () => puzzleHintsStore.getHint();
const puzzleAssistanceStore = usePuzzleAssistanceStore();
const {
	userCheck: userCheckErrors,
	autoFilledBoardCheck: autoCheckErrors
} = puzzleAssistanceStore;

// TODO: enable/disable wakeLock (was removed sometime, possibly accidentally)
const wakeLock = usePuzzleWakeLock();
const userIdle = wakeLock.idle;

const { hasCurrentSavedGame, savePuzzleSaveData } = useSavedPuzzle();

const puzzleStore = usePuzzleStore();
const {
	board, initialized, started, paused, finished,
	rowCounts, colCounts: columnCounts,
	finishedAndSolved, finishedWithMistakes,
} = storeToRefs(puzzleStore);
const rows = computed(() => puzzleStore.height ?? undefined);
const columns = computed(() => puzzleStore.width ?? undefined);
const difficulty = computed(() => {
	return puzzleStore.difficulty as DifficultyKey;
})

const pausedByUser = readonly(toRef(puzzleStore, 'pausedByUser'));
const pause = () => {
	puzzleStore.setPaused(true, { userAction: true });
}
const resume = () => {
	puzzleStore.setPaused(false, { userAction: true });
}

watch(userIdle, (isIdle) => {
	if (isIdle && !puzzleStore.paused) {
		pause();
	}
})

const mainStore = useMainStore();
const windowHidden = toRef(mainStore.context, 'windowHidden');

const finishedTimeout = ref<null | ReturnType<typeof setInterval>>(null);
const mistakeCheckTimeout = ref<null | ReturnType<typeof setInterval>>(null);
const autoSaveInterval = ref<null | ReturnType<typeof setInterval>>(null);

const dropdownOpen = ref(false);
const settingsOpen = ref(false);

const rulerType = computed(() => {
	if (showBoardCoordinates.value) return 'coords';
	else if (showLineInfo.value === RULER_TYPE.COUNT_REMAINING) return 'count-remaining';
	else if (showLineInfo.value === RULER_TYPE.COUNT_CURRENT) return 'count-current';
	return null;
})
const rulerSize = computed(() => {
	if (showBoardCoordinates.value) {
		return '16px';
	} else if (showBoardLineCounts.value) {
		return 'cellSize';
	} else return '0px';
})

const progress = computed(() => {
	const base = puzzleStore.progress;
	const rounded = Math.ceil(base * 100);
	// prevent progress from being 100 when not every cell is filled
	if (rounded == 100 && base < 1) return 99;
	return rounded;
})
const boardGrid = computed(() => board.value?.grid);
const puzzleShouldBePaused = computed(() => {
	return pausedByUser.value || settingsOpen.value || dropdownOpen.value || windowHidden.value;
})

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
const canSaveGame = () => {
	return initialized.value && started.value && !finished.value && boardGrid.value != null;
}
const saveGame = () => {
	if (canSaveGame()) {
		savePuzzleSaveData();
	}
}
const route = useRoute();
const router = useRouter();
const exitGame = () => {
	if (canSaveGame()) {
		saveGame(); // TODO: unnecessary canSaveGame check
	}
	const metaFrom = route.meta.prev;
	if (metaFrom == null) {
		router.replace({ name: 'NewPuzzleFreePlay' });
	} else {
		router.go(-1);
	}
}
const { undoLastMove: undo, restartPuzzle: restart } = puzzleStore;
const dropdownToggled = (val: boolean) => dropdownOpen.value = val;
const finishGame = async () => puzzleStore.finishPuzzle();

const initAutoSave = () => {
	if (autoSaveInterval.value != null) {
		console.error('Trying to init autosave, but it is already running. Resetting.');
		clearInterval(autoSaveInterval.value);
	}
	autoSaveInterval.value = globalThis.setInterval(() => {
		saveGame();
	}, 1500);
}
const stopAutoSave = () => {
	clearInterval(autoSaveInterval.value!);
	autoSaveInterval.value = null;
}

const checkErrors = () => {
	userCheckErrors();
}

const debouncedPause = debounce((value: boolean) => {
	puzzleStore.pauseGame(value);
}, 150);

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
	if (canSaveGame()) {
		saveGame(); // TODO: unnecessary canSaveGame check
	}
	stopAutoSave();

	clearTimeout(finishedTimeout.value!);
	clearTimeout(mistakeCheckTimeout.value!);
})

// TODO: ON BEFORE ROUTE ENTER
/*
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
*/

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
	if (typeof toName === 'string' && toName.toLowerCase().includes('settings')) {
		settingsOpen.value = true;
	} else settingsOpen.value = false;
	next();
})

watch(finishedAndSolved, (newValue, prevValue) => {
	if (newValue) {
		finishedTimeout.value = globalThis.setTimeout(() => {
			finishGame();
			finishedTimeout.value = null;
		}, 600);
	} else if (prevValue && !newValue) {
		// no longer correctly solved
		clearTimeout(finishedTimeout.value!);
		finishedTimeout.value = null;
	}
})

watch(finishedWithMistakes, (newValue) => {
	if (newValue) {
		mistakeCheckTimeout.value = globalThis.setTimeout(() => {
			mistakeCheckTimeout.value = null;
			if (!finishedWithMistakes.value) {
				return;
			}
			autoCheckErrors();
		}, 2000);
	} else {
		clearTimeout(mistakeCheckTimeout.value!);
		mistakeCheckTimeout.value = null;
	}
})

watch(puzzleShouldBePaused, (newValue, prevValue) => {
	globalThis.setTimeout(() => {
		if (newValue && !prevValue) {
			// immediately pause
			debouncedPause(true);
			debouncedPause.flush();
		} else if (!newValue && prevValue) {
			// but have a small delay when resuming
			debouncedPause(false);
		}
	}, 1000 / 30);
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