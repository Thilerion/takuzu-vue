<template>
<div
	ref="heatmapGridEl"
	class="heatmap pr-0.5 pb-2 grid min-w-40 max-w-full overflow-x-auto relative touch-pan-x"
>
	<StatisticsHeatMapMonths
		:cells="heatmapCells"
		row="month-start / month-end"
		:column="`cell-col-start / span ${numWeeks}`"
		class="z-10 pt-2 snap-both"
	/>
	<StatisticsHeatMapWeekdays
		row="1 / span 8"
		column="1 / span 1"
		class="z-10 snap-both"
	/>
	<div
		v-for="cell in heatmapCells"
		:key="cell.dateStr"
		:style="{
			'grid-row': `cell-row-start ${cell.weekday + 1} / cell-row-end ${cell.weekday + 1}`,
			'grid-column': `cell-col-start ${cell.weekIndex + 1} / cell-col-end ${cell.weekIndex + 1}`,
		}"
		class="heatmap-item snap-end"
		:class="{ 'is-selected': cell.dateStr === selected }"
		:data-level="getLevelFromDate(cell.dateStr)"
		:data-has-data="items.has(cell.dateStr)"
		@click="emit('toggle', cell.dateStr)"
	></div>
</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { createHeatmapRangeCells } from '../../helpers/heatmap-base-data.js';

export type HeatMapItem = {
	dateStr: string,
	date: Date,
	level: number,
	data: {
		puzzlesPlayed: number,
		totalTime: number
	}
}

const emit = defineEmits<{
	(e: 'toggle', value: string): void
}>();

const props = defineProps<{
	range: { start: Date, end: Date },
	items: Map<string, HeatMapItem>,
	selected?: string | undefined, // DateStr or undefined
}>();

const getLevelFromDate = (dateStr: string) => {
	const item = props.items.get(dateStr);
	if (item == null) return 0;
	return item.level;
}

const heatmapCells = ref(createHeatmapRangeCells(props.range));
const numWeeks = computed(() => {
	const lastCell = heatmapCells.value.at(-1);
	if (lastCell == null) return 0;
	return lastCell.weekIndex + 1;
})

const numRows = 7;
const numCols = computed(() => numWeeks.value);

// Set element scrolled to the end
const heatmapGridEl = ref<HTMLElement | null>(null);
const scrollToEnd = async (el: HTMLElement) => {
	el.scrollTo(el.scrollWidth, 0);
};
onMounted(() => {
	if (heatmapGridEl.value == null) return;
	scrollToEnd(heatmapGridEl.value);
});
</script>

<style scoped>
.heatmap {
	--cellsize: 1.25rem;
	grid-template-rows: [month-start] auto [month-end] repeat(v-bind(numRows), [cell-row-start] var(--cellsize) [cell-row-end]);
	grid-template-columns: [day-start] auto [day-end] repeat(v-bind(numCols), [cell-col-start] var(--cellsize) [cell-col-end]);
	@apply gap-0.5;

	/* Seems buggy when using proximity */
	scroll-snap-type: x mandatory;
	scroll-padding: 2px;
}

.heatmap-item {
	@apply aspect-square rounded-[1px];
	width: var(--cellsize);
	height: var(--cellsize);
	background-color: var(--bg);
	box-shadow: inset 0 0 var(--shadow-blur) 0 rgb(0 0 0 / var(--shadow-opacity));

	scroll-snap-align: end;
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

[data-has-data="true"] {
	@apply transition-shadow duration-75 hover-hover:hover:duration-200 cursor-pointer ring-1 ring-transparent hover-hover:hover:ring-purple-950;
}
.is-selected {
	@apply ring-purple-950 ring-[2px] z-20 rounded-sm;
}
</style>
