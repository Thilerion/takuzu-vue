<template>
<div
	ref="heatmapGridEl"
	class="heatmap pr-2 pb-2 grid min-w-40 max-w-full overflow-x-auto relative"
>
	<StatisticsHeatMapMonths
		:cells="heatmapCells"
		row="month-start / month-end"
		:column="`cell-col-start / span ${numWeeks}`"
		class="z-10 pt-2"
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
		}"
		class="heatmap-item"
		:data-level="getLevelFromDate(cell.dateStr)"
	></div>
</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { createHeatmapRange, createHeatmapRangeCells } from '../../helpers/heatmap-base-data.js';
import type { StatsDbExtendedStatisticDataEntry } from '@/services/db/stats-db/models.js';
import { createDailyActivitySummaries, rankDailyActivitySummaries } from '../../helpers/activity-summaries.js';

const props = defineProps<{
	items: StatsDbExtendedStatisticDataEntry[]
}>();

const activitySummaries = computed(() => createDailyActivitySummaries(props.items));
const activityRanks = computed(() => {
	return rankDailyActivitySummaries(activitySummaries.value);
})
onMounted(() => console.log(activitySummaries.value, activityRanks.value));

const getLevelFromDate = (date: string) => {
	const rankVal = activityRanks.value.get(date);
	if (rankVal == null) return 0;
	return rankVal + 1;
}

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
	@apply w-4 h-4 aspect-square rounded-[1px];
	background-color: var(--bg);
	box-shadow: inset 0 0 var(--shadow-blur) 0 rgb(0 0 0 / var(--shadow-opacity));
}

[data-level] {
	--bg-opacity: 1;
	--shadow-opacity: 0.1;
}

[data-level="0"] {
	--bg: hsl(193, 44%, 96%);
	--shadow-opacity: 0.05;
}

[data-level="1"] {
	--bg: #9ebcda;
}

[data-level="2"] {
	--bg: #8c96c6;
}

[data-level="3"] {
	--bg: #8c6bb1;
}

[data-level="4"] {
	--bg: #88419d;
}

[data-level="5"] {
	--bg: #6e016b;
}
</style>
