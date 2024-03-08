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
			:key="puzzleGridForceReplaceKey"
			:board :rows :columns :paused
			:style="{
				'max-width': gridWidth,
				'max-height': gridHeight,
			}"
			:initial-grid="puzzleStore.initialBoard!.grid"
			:marked-mistakes="assistStore.markedMistakes"
			@toggle-cell="toggleCell"
		/>

		<PuzzleGridPauseOverlay
			:paused
			@resume="resumeByUser"
			class="pause-overlay"
		/>
		<PuzzleCheckIndicator />
	</div>
</template>

<script setup lang="ts">
import PuzzleGrid from './PuzzleGrid.vue';
import type { SimpleBoard } from '@/lib/index.js';
import type { VecValue } from '@/lib/types.js';
import { usePuzzleAssistanceStore } from '@/stores/assistance/store.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { usePuzzlePauseResume } from '@/stores/puzzle/usePuzzlePauseResume.js';
import { computed } from 'vue';

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
	console.log('resume by user');
	manualResumeGame();
}

// For PuzzleGrid prop: markedMistakes
const assistStore = usePuzzleAssistanceStore();

// Force PuzzleGrid component to be replaced/reloaded whenever the puzzle changes. This can be achieved using the initialBoard or the solutionBoard in the puzzleStore.
// In this case, solutionBoardStr is used as it is already available in the store.
const puzzleGridForceReplaceKey = computed((): string => puzzleStore.solutionBoardStr ?? '');
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