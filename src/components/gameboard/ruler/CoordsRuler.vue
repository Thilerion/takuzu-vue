<template>
	<div
		class="ruler coords"
		:class="{
			'ruler-rows': lineType === 'rows',
			'ruler-columns': lineType === 'columns'
	}">
		<div
			class="ruler-cell"
			v-for="lineId in lineIds"
			:key="lineId"
			:class="{
				'error': linesWithError.includes(lineId),
				'complete': completedLines.has(lineId)
			}"
		>{{lineId}}</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { logicOr } from '@vueuse/math';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { type PuzzleSymbol, ROW, COLUMN, ZERO, ONE } from '@/lib/constants.js';
import { useRulerCellCountData } from './useRulerCellCountData.js';
import { useLineCounts } from './useLineCounts.js';
import type { LineCounts, LineId } from '@/lib/types.js';

const props = defineProps<{
	lineType: 'rows' | 'columns',
	lineIds: ReadonlyArray<LineId>
}>();

// TODO: similarly to CountsRuler, also (optionally!) highlight red if incorrect, and maybe show if line is complete
const coordsRulerErrorsEnabled = ref(true);
const coordsRulerCompleteHelperEnabled = ref(true);

const rulerCountDataEnabled = logicOr(coordsRulerErrorsEnabled, coordsRulerCompleteHelperEnabled);
const puzzleStore = usePuzzleStore()
const lineRequired = computed((): Record<PuzzleSymbol, number> | undefined => {
	if (!rulerCountDataEnabled.value) return undefined;
	const key = props.lineType === 'rows' ? ROW : COLUMN;
	return puzzleStore.board?.numRequired?.[key];
})
const allCounts = useLineCounts();
const counts = computed((): LineCounts | null => {
	if (!rulerCountDataEnabled.value) return null;
	return props.lineType === 'rows' ? allCounts.rowCounts.value! : allCounts.colCounts.value!;
})

const { data: rulerCountData } = useRulerCellCountData(
	counts, lineRequired,
	{ debounceDelay: 180, maxWait: 180 * 2.2 }
);

const linesWithError = computed(() => {
	const results: LineId[] = [];
	if (!coordsRulerErrorsEnabled.value || rulerCountData.value == null) return results;
	for (const lineData of rulerCountData.value) {
		if (lineData[ZERO].error || lineData[ONE].error) {
			results.push(props.lineIds[lineData.index]);
		}
	}
	return results;
})
const completedLines = computed((): Set<LineId> => {
	const result = new Set<LineId>();
	if (!coordsRulerCompleteHelperEnabled.value || rulerCountData.value == null) return result;
	for (const lineData of rulerCountData.value) {
		if (lineData.isComplete) {
			result.add(props.lineIds[lineData.index]);
		}
	}
	return result;
})
</script>

<style scoped>
.ruler {
	@apply flex leading-none;
	font-size: 10px;
}
.ruler-rows {
	grid-area: ruler-rows;
	width: 16px;
	@apply flex-col justify-around items-center h-full overflow-y-hidden;
	
}
.ruler-columns {
	grid-area: ruler-cols;
	height: 16px;
	@apply flex-row justify-around items-center w-full overflow-x-hidden;
}	
.ruler-cell {
	@apply text-center flex items-center justify-center h-full w-full transition-all duration-0 delay-0 decoration-transparent;
}
.ruler-cell.error {
	@apply text-red-700 duration-300 delay-700;
}
.ruler-cell.complete {
	@apply text-black/70 duration-200 delay-0 underline decoration-black/30 underline-offset-2;
}
.puzzle-paused :is(.ruler-cell.error, .ruler-cell.complete) {
	@apply transition-none no-underline;
}
.puzzle-paused .ruler-cell {
	@apply text-inherit opacity-40;
}
.ruler-rows > .ruler-cell {
	@apply mr-auto;
	max-height: var(--cell-size);
}
.ruler-columns > .ruler-cell {
	@apply mb-auto;
	max-width: var(--cell-size);
}
</style>