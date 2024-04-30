<template>
<div
	class="ruler grid leading-none place-items-center gap-[--grip-gap]"
	:data-ruler-dir="props.lineType"
>
	<CountsRulerCell
		v-for="data in rulerLineCountData"
		:key="data.index"
		:type="countType"
		v-bind="{ one: data[ONE], zero: data[ZERO], complete: data.isComplete }"
	/>
</div>
</template>

<script setup lang="ts">
import { COLUMN, ONE, ROW, ZERO } from '@/lib/constants';
import { computed, toRefs } from 'vue';
import { useLineCounts } from './useLineCounts.js';
import type { LineCounts, PuzzleSymbolCount } from '@/lib/types.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { useRulerCellCountData } from './useRulerCellCountData.js';

// TODO: make showing errors optional here
export type RulerCountType = 'remaining' | 'current';

const props = defineProps<{
	lineType: 'rows' | 'columns',
	countType: RulerCountType,
	cellSize: number
}>();

const allCounts = useLineCounts();
const counts = computed((): LineCounts => {
	return props.lineType === 'rows' ? allCounts.rowCounts.value! : allCounts.colCounts.value!;
})

const { countType } = toRefs(props);
const puzzleStore = usePuzzleStore();
const lineRequired = computed((): PuzzleSymbolCount | undefined => {
	const key = props.lineType === 'rows' ? ROW : COLUMN;
	return puzzleStore.board?.numRequired?.[key];
})

const {
	data: rulerLineCountData
} = useRulerCellCountData(
	counts,
	lineRequired,
	{ debounceDelay: 180, maxWait: 180 * 2.2 }
)

const cellPadding = computed(() => {
	if (props.cellSize > 40) {
		return '14%';
	} else if (props.cellSize > 32) {
		return '13%';
	} else if (props.cellSize > 27) {
		return '4px';
	} else {
		return '2px';
	}
})
</script>

<style scoped>
.ruler {
	--ruler-cell-size: calc(var(--cell-size) - var(--grid-gap));
	--half-size: calc(var(--cell-size) / 4);
	--font-size: clamp(10px, var(--half-size), 2rem);
	--cell-padding: v-bind(cellPadding);

	font-size: var(--font-size);

	@apply pointer-events-none touch-none;
}

[data-ruler-dir="rows"] {
	width: var(--ruler-cell-size);
	@apply h-full flex-col;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: 1fr;
}
[data-ruler-dir="columns"] {
	height: var(--ruler-cell-size);
	@apply w-full flex-row;
	grid-template-columns: repeat(var(--columns), 1fr);
	grid-template-rows: 1fr;
}
</style>