<template>
	<div class="puzzle-grid">
		<FastPuzzleCellWrapper
			v-for="{ listKey, key: xyKey, x, y, initialValue, locked } in staticCellData"
			:key="listKey"
			@toggle="onCellClick"
			v-bind="{ x, y, listKey, initialValue }"
			:value="grid[y][x]"
			:locked="locked"
			:incorrect="incorrectCellKeys[xyKey]"
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
import type { SimpleBoard } from '@/lib/index.js';
import type { PuzzleGrid, VecValue, XYKey } from '@/lib/types.js';
import { computed, toRefs } from 'vue';
import { useStaticGridCellData } from './composables/useGridCellData.js';
import { usePuzzleTapVibrate } from './composables/usePuzzleTapVibrate.js';
import { initGlobalCellThemeProvider } from './composables/useCellThemeProvider.js';

const props = defineProps<{
	board: SimpleBoard,
	rows: number,
	columns: number,
	paused: boolean,
	initialGrid: PuzzleGrid,
	markedMistakes: `${number},${number}`[]
}>();
const { rows, columns, initialGrid } = toRefs(props);

const emit = defineEmits<{
	(e: 'toggle-cell', val: VecValue): void
}>();

// VIBRATION SETTING AND COMPOSABLE
const { vibrate } = usePuzzleTapVibrate(rows, columns);

// GRID CELL DATA
const staticCellData = useStaticGridCellData(rows, columns, initialGrid);
const grid = computed((): PuzzleGrid => props.board.grid);
const incorrectCellKeys = computed((): Record<XYKey, boolean> => {
	return props.markedMistakes.reduce((acc, xykey) => {
		acc[xykey] = true;
		return acc;
	}, {} as Record<XYKey, boolean>);
})

// CELL THEME
const {
	cellComponent
} = initGlobalCellThemeProvider();

// CELL METHODS
const onCellClick = (val: VecValue) => {
	if (props.paused) return;
	vibrate();
	emit('toggle-cell', val);
}
</script>

<style scoped>
.puzzle-grid {
	--cell-size-total: calc(var(--cell-size) - var(--grid-gap));
	grid-area: puzzle-grid;
	grid-template-rows: repeat(var(--rows), var(--cell-size-total));
	grid-template-columns: repeat(var(--columns), var(--cell-size-total));
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