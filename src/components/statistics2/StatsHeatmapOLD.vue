<template>
<div v-if="false" class="heatmap-wrapper bg-white shadow pr-2 w-full max-w-full overflow-x-hidden relative overflow-y-hidden flex flex-col text-right py-2" ref="heatmapWrapper">
	<div class="weekdays absolute left-0 pr-1 top-2 bottom-2 bg-white pl-2 flex flex-col gap-[3px] justify-end">
		<div class="empty-week-row h-6"></div>
		<div v-for="(weekday, idx) in weekdayNames" class="weekday flex-1 pr-[2px] text-xs text-right">
			<span v-if="displayWeekdays.includes(idx)">{{weekday}}</span>
		</div>
	</div>
	<div class="heatmap grid min-w-[500px] min-h-[50px] ml-auto gap-[3px]">
		<div class="months col-span-full row-span-1 bg-red-400">
			<div class="month">Jan</div>
			<div class="month">Feb</div>
			<div class="month">Mar</div>
		</div>
		<div class="square text-xxs w-4 h-4 bg-purple-200" v-for="square in squares" :key="square.idx"></div>
	</div>
</div>

<div class="hm-wrapper w-screen overflow-x-hidden" v-else>
	<div class="days flex flex-col">
		<div class="day" v-for="(weekday, idx) in weekdayNames">
			<span v-if="displayWeekdays.includes(idx)">{{weekday}}</span>
		</div>
	</div>
	<div class="hm-inner min-w-0 overflow-x-hidden">
		<div class="hm">
			<div class="hm-months"></div>
			<div class="cell text-xxs bg-purple-200" v-for="square in squares" :key="square.idx"></div>
		</div>
	</div>
</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { getWeekDaysShort } from '@/utils/date.utils.js';

const numWeeks = ref(30);
const numWeekdays = 7;

const numSquares = numWeeks.value * numWeekdays;

const weekdayNames = getWeekDaysShort();
console.log(weekdayNames);

const displayWeekdays = [
	1, 3, 5
];

const squares = computed(() => {
	const result = [];
	for (let i = 0, idx = 0; i < numWeeks.value; i++) {
		for (let j = 0; j < numWeekdays; j++, idx++) {
			result.push({
				week: i,
				weekday: j,
				idx
			})
		}
	}
	return result;
})

const heatmapWrapper = ref(null);
</script>

<style scoped>
.hm-wrapper {
	--grid-gap: 0.125rem;
	--square-gap: 3px;
	--square-size: 1rem;

	--gap-diff: calc(var(--grid-gap) - var(--square-gap));

	--months-height: 1.5rem;
	--weekdays-width: 1.5rem;

	@apply grid w-full bg-white shadow p-2 pr-3;

	grid-template-rows: var(--months-height) max-content auto;
	grid-template-columns: var(--weekdays-width) 1fr;
	gap: var(--grid-gap);

	grid-template-areas: ". inner" "weekdays inner";
}

.days {
	gap: var(--square-gap);
	@apply text-xs text-right pr-1;
	grid-area: weekdays;
}
.days > .day {
	width: 100%;
	height: var(--square-size);
	@apply flex-shrink-0;
}

.hm-inner {
	grid-area: inner;
	direction: rtl;
	@apply grid relative;
	gap: var(--grid-gap);
}
.hm-months {
	height: var(--months-height);
	@apply row-start-1 col-span-full;
	@apply box-content;
	margin-bottom: var(--gap-diff);
}
.hm {
	@apply grid relative;
	/* top: calc(var(--grid-gap) - var(--square-gap)); */
	direction: ltr;
	gap: var(--square-gap);
	grid-template-rows: repeat(v-bind(numWeekdays), auto);
	grid-template-columns: repeat(v-bind(numWeeks), auto);
}
.cell {
	width: var(--square-size);
	height: var(--square-size);
}



.heatmap-wrapper {
	direction: rtl;
}
.heatmap {
	direction: ltr;

	grid-template-rows: 1.5rem repeat(v-bind(numWeekdays), auto);
	grid-template-columns: repeat(v-bind(numWeeks), auto);

	grid-auto-flow: column;
	
}

.weekdays {
	width: min-content;
	max-width: 3rem;
	min-width: 3ch;
}
</style>