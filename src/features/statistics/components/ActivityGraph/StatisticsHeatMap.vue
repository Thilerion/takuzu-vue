<template>
<div
	ref="heatmapGridEl"
	class="heatmap grid min-w-40 max-w-full overflow-x-auto overflow-y-hidden relative"
>
	<StatisticsHeatMapMonths
		:cells="heatmapCells"
		row="month-start / month-end"
		:column="`cell-col-start / span ${numWeeks}`"
		class="z-10"
	/>
	<StatisticsHeatMapWeekdays
		row="1 / span 8"
		column="1 / span 1"
		class="z-10"
	/>
	<div
		v-for="cell in heatmapCells"
		:key="cell.dateStr"
		:style="{
			'grid-row': `cell-row-start ${cell.weekday + 1} / cell-row-end ${cell.weekday + 1}`,
			'grid-column': `cell-col-start ${cell.weekIndex + 1} / cell-col-end ${cell.weekIndex + 1}`,
			'opacity': `${cell.weekIndex / 53}`
		}"
		class="heatmap-item"
		:class="{
			'bg-purple-700': cell.weekday === 0,
			'bg-orange-600': cell.weekday === 1,
			'bg-orange-500': cell.weekday === 2,
			'bg-orange-400': cell.weekday === 3,
			'bg-orange-300': cell.weekday === 4,
			'bg-orange-200': cell.weekday === 5,
			'bg-green-200': cell.weekday === 6,
		}"
	></div>
	<!-- <div
		class="bg-blue-100"
		:style="{
			'grid-row': '1 / -1',
			'grid-column': '-1 / span 1'
		}"
	></div> -->
</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { createHeatmapRange, createHeatmapRangeCells } from '../../helpers/heatmap-base-data.js';

const range = ref(createHeatmapRange());
const heatmapCells = ref(createHeatmapRangeCells(range.value));
const numWeeks = computed(() => {
	const lastCell = heatmapCells.value.at(-1);
	if (lastCell == null) return 0;
	return lastCell.weekIndex + 1;
})

const numRows = ref(7);
const numCols = computed(() => numWeeks.value);

const heatmapGridEl = ref<HTMLElement | null>(null);
const scrollToEnd = async (el: HTMLElement) => {
	el.scrollTo(el.scrollWidth, 0);
};
watch(heatmapGridEl, (el) => {
	if (el == null) return;
	scrollToEnd(el);
});
</script>

<style scoped>
.heatmap {
	grid-template-rows: [month-start] auto [month-end] repeat(v-bind(numRows), [cell-row-start] 1rem [cell-row-end]);
	grid-template-columns: [day-start] auto [day-end] repeat(v-bind(numCols), [cell-col-start] 1rem [cell-col-end]);
	@apply gap-0.5;
}

.heatmap-item {
	@apply w-4 h-4 aspect-square;
}
</style>