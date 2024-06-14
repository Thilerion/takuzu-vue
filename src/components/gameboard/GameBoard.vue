<template>
<div
	class="board inline-grid relative"
>
	<div class="ruler-wrapper-columns" :class="{paused}"><slot name="ruler-columns" /></div>
	<div class="ruler-wrapper-rows" :class="{paused}"><slot name="ruler-rows" /></div>
	<div class="puzzle-info-wrapper">
		<slot name="puzzle-info" />
	</div>

	<PuzzleGrid
		v-if="initialBoard != null"
		:key="puzzleGridForceReplaceKey"
		:board
		:rows
		:columns
		:paused
		:style="{
			'max-width': gridWidth,
			'max-height': gridHeight,
		}"
		:initial-grid="initialBoard.grid"
		:error-marks="errorMarks"
		@toggle-cell="toggleCell"
	/>

	<PuzzleGridPauseOverlay
		:paused
		class="pause-overlay"
		@resume="resumeByUser"
	/>
	<PuzzleCheckIndicator />
</div>
</template>

<script setup lang="ts">
import type { SimpleBoard } from '@/lib/board/Board.js';
import PuzzleGrid from './PuzzleGrid.vue';
import type { VecValue } from '@/lib/types.js';
import { usePuzzleVisualCuesStore } from '@/features/puzzle-visual-cues/store.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { usePuzzlePauseResume } from '@/stores/puzzle/usePuzzlePauseResume.js';
import { watch, computed, ref, toRef } from 'vue';

defineProps<{
	rows: number,
	columns: number,
	gridHeight: string,
	gridWidth: string,
	cellSize: number,
	board: SimpleBoard,
	paused: boolean,
}>();
const puzzleStore = usePuzzleStore();
const toggleCell = ({ x, y, value }: VecValue) => puzzleStore.toggle({ x, y, prevValue: value });
const { manualResumeGame } = usePuzzlePauseResume();
const resumeByUser = () => {
	manualResumeGame();
}

// For PuzzleGrid prop: markedMistakes
const visualCuesStore = usePuzzleVisualCuesStore();
const errorMarks = computed(() => visualCuesStore.cellMarks.filter(m => m.errorType === 'incorrectValue'));

// TODO: use a PuzzleStore event emitter with the "onNewPuzzle" or "onPuzzleTransformed" event
// Force PuzzleGrid component to be replaced/reloaded whenever the puzzle changes, while the route has not changed. This can be achieved using any of the 3 boards in the puzzleStore.
// However, initialBoard/solution are preferred, as they are barely accessed and should not receive any changes normally, so they are safer to use.
const puzzleGridForceReplaceKey = ref(0);
const initialBoard = toRef(puzzleStore, 'initialBoard');
watch(initialBoard, (val, prev) => {
	if (val !== prev && val != null) {
		puzzleGridForceReplaceKey.value += 1;
	}
}, { deep: false /** important not to watch deep, should only know when entire grid is replaced */ })
</script>

<style scoped>
.board {
	grid-template-areas: 
		". info"
		". ruler-cols"
		"ruler-rows puzzle-grid";
	--cell-size-num: v-bind(cellSize);
	--cell-size: calc(var(--cell-size-num) * 1px);
}

.pause-overlay {
	grid-area: puzzle-grid;
}

.puzzle-info-wrapper {
	grid-area: info;
	/* Flexbox with child min-width to keep center on overflow */
	@apply relative flex flex-row justify-center w-full items-start;
}

.ruler-wrapper-columns {
	grid-area: ruler-cols;
	@apply h-full overflow-y-hidden;
	/* @apply bg-red-100; */
}
.ruler-wrapper-rows {
	grid-area: ruler-rows;
	@apply w-full overflow-x-hidden;
	/* @apply bg-blue-100; */
}
</style>