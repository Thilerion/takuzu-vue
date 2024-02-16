<template>
	<div class="main justify-center items-center relative" ref="container">
		<div
			class="puzzle-wrapper"
			:class="[`cell-size-${cellSizeCategory}`]"
			v-show="validElDimensions"
		>
			<slot v-bind="puzzleGridDimensions" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { useThrottledElementSizeObserver } from './composables/useThrottledElementSizeObserver.js';
import { useDynamicPuzzleGridSize } from './composables/useDynamicPuzzleGridSize.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';

const props = withDefaults(defineProps<{
	rulerHeight: number | 'cellSize' | null, // number: px value, cellSize for equal to cellSize, null for hidden
	rulerWidth: number | 'cellSize' | null,
	infoHeight: number | 'cellSize' | null,
	paddingX?: number,
	paddingY?: number
}>(), {
	paddingX: 4,
	paddingY: 6
});

const { rulerHeight, rulerWidth, infoHeight, paddingX, paddingY } = toRefs(props);

const container = ref<HTMLElement | null>(null);
const puzzleStore = usePuzzleStore();
const rows = computed(() => puzzleStore.height!);
const columns = computed(() => puzzleStore.width!);

const elDimensions = useThrottledElementSizeObserver(
	container,
	{
		delay: 500,
		leading: true,
		trailing: true
	}
);
const validElDimensions = computed(() => {
	const { width, height } = elDimensions.value;
	return width > 0 && height > 0;
})

const { puzzleGridDimensions } = useDynamicPuzzleGridSize(
	elDimensions,
	{
		width: columns,
		height: rows
	},
	{
		width: rulerWidth,
		height: rulerHeight,
	},
	{
		height: infoHeight
	},
	{
		x: paddingX,
		y: paddingY
	}
);

export type CellSizeCategory = 'xs' | 's' | 'm' | 'l' | 'xl';
const cellSizeCategory = computed((): CellSizeCategory => {
	const { cellSize } = puzzleGridDimensions.value;
	if (cellSize <= 26) {
		return "xs";
	} else if (cellSize <= 38) {
		return "s";
	} else if (cellSize <= 52) {
		return "m";
	} else if (cellSize <= 74) {
		return "l";
	} else {
		return "xl";
	}
});
</script>

<style scoped>
.main {
	@apply flex-1 flex flex-col;
	overflow: hidden;

	--rows: v-bind(rows);
	--columns: v-bind(columns);
	--aspect-ratio: calc(var(--columns) / var(--rows));
}

.puzzle-wrapper {
	/* default grid gap for puzzle-grid and rulers */
	--grid-gap: 2px;
	--cell-rounding: 2px;
}

.puzzle-wrapper.cell-size-xs {
	--grid-gap: 1px;
	--cell-rounding: 0px;
}

.puzzle-wrapper.cell-size-s {
	--grid-gap: 1px;
	--cell-rounding: 2px;
}

.puzzle-wrapper.cell-size-m {
	--grid-gap: 2px;
	--cell-rounding: 2px;
}

.puzzle-wrapper.cell-size-l {
	--grid-gap: 3px;
	--cell-rounding: 3px;
}

.puzzle-wrapper.cell-size-xl {
	--grid-gap: 4px;
	--cell-rounding: 4px;
}
</style>