<template>
	<div class="puzzle-grid" :inert="paused">
		<FastPuzzleCellWrapper
			v-for="{ listKey, key: xyKey, x, y, locked } in staticCellData"
			:key="listKey"
			@toggle="onCellClick"
			:x :y :listKey :locked
			:value="keyedGrid[xyKey]"
			:incorrect="errorMarkKeys[xyKey]"
			v-memo="[keyedGrid[xyKey], errorMarkKeys[xyKey]]"
		>
			<template v-slot="{ value, locked, incorrect }">
				<component
					v-if="cellComponent != null"
					:is="cellComponent"
					v-bind="{ value, locked, incorrect }"
				></component>
				<div v-else>{{ value }}</div>
			</template>
		</FastPuzzleCellWrapper>
		<PuzzleGridHighlights />
	</div>
</template>

<script setup lang="ts">
import type { PuzzleGrid, VecValue, XYKey } from '@/lib/types.js';
import { computed, toRefs } from 'vue';
import { useStaticGridCellData } from './composables/useGridCellData.js';
import { usePuzzleTapVibrate } from './composables/usePuzzleTapVibrate.js';
import { injectCellThemeData } from './composables/useCellThemeProvider.js';
import type { PuzzleValue } from '@/lib/constants.js';
import type { ErrorMark } from '@/helpers/puzzle-visual-cues.js';
import type { SimpleBoard } from '@/lib/board/Board.js';

const props = defineProps<{
	board: SimpleBoard,
	rows: number,
	columns: number,
	paused: boolean,
	initialGrid: PuzzleGrid,
	errorMarks: ErrorMark[]
}>();
const { rows, columns, initialGrid } = toRefs(props);

const emit = defineEmits<{
	(e: 'toggle-cell', val: VecValue): void
}>();

// VIBRATION SETTING AND COMPOSABLE
const { vibrate } = usePuzzleTapVibrate(rows, columns);

// GRID CELL DATA
// probably does not need to be a composable, as the data does not need to be reactive: this component gets replaced whenever the puzzle/initialBoard changes
const staticCellData = useStaticGridCellData(columns, rows, initialGrid);

/** XYKey/id of each marked error */
const errorMarkKeys = computed((): Record<XYKey, boolean> => {
	return props.errorMarks.reduce((acc, mark) => {
		const xykey: XYKey = mark.id;
		acc[xykey] = true;
		return acc;
	}, {} as Record<XYKey, boolean>);
})
const keyedGrid = computed((): Record<XYKey, PuzzleValue> => {
	const grid = props.board.grid;
	const result: Record<XYKey, PuzzleValue> = {};
	for (let y = 0; y < props.rows; y++) {
		for (let x = 0; x < props.columns; x++) {
			result[`${x},${y}`] = grid[y][x];
		}
	}
	return result;
})

// CELL THEME
const {
	cellComponent
} = injectCellThemeData();

// CELL METHODS
const onCellClick = (val: VecValue) => {
	if (props.paused) {
		console.warn('PuzzleGrid onCellClick (puzzle cell toggled) while game is paused. Ignoring.');
		return;
	}
	vibrate();
	emit('toggle-cell', val);
}
</script>

<style scoped>
.puzzle-grid {
	--cell-size-total: calc(var(--cell-size) - var(--grid-gap));
	grid-area: puzzle-grid;
	grid-template-rows: repeat(var(--rows), [cell-row-start] var(--cell-size-total) [cell-row-end]);
	grid-template-columns: repeat(var(--columns), [cell-col-start] var(--cell-size-total) [cell-col-end]);
	@apply mr-auto mb-auto grid relative justify-items-stretch items-stretch;
	gap: var(--grid-gap);
}

.puzzle-paused .puzzle-grid,
.puzzle-finished .puzzle-grid {
	@apply pointer-events-none;
}

.puzzle-cell-wrapper {
	position: relative;
}

.touch-anim-el {
	@apply absolute inset-0 pointer-events-none w-full h-full z-30 ring-2 ring-gray-700 opacity-100;
}

.incorrect-mark {
	@apply absolute inset-0 text-black flex items-center justify-center pointer-events-none leading-none w-full h-full overflow-hidden opacity-60;
}

.incorrect-mark>div {
	width: 2px;
	height: 200%;
	@apply bg-black transform -rotate-45 -translate-x-px;
}

.incorrect-mark>div:first-child {
	@apply rotate-45 translate-x-px;
}

.mark-fade-leave-active {
	transition: none
}

.mark-fade-leave-active {
	transition: opacity .2s ease;
}

.mark-fade-leave-to,
.mark-fade-enter-from {
	opacity: 0;
}
</style>