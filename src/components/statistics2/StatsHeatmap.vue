<template>
		<div class="hmwrapper2 overflow-x-auto overflow-y-visible w-full mx-auto h-fit snap-both snap-proximity bg-white">

		<div class="hmwrapper grid w-fit snap-end mx-auto">
			<div class="row-1 relative">
				<!-- <div class="month" :style="month.styles" v-for="month in months">{{month.name}}</div> -->
				<div class="month"
					v-for="month in months"
					:style="{
						'grid-column': `${month.colStart} / span 3`,
						'grid-row': '1 / span 1',
						'z-index': month.colStart
					}"
				>{{month.name}}</div>
			</div>
			<div class="column-1 flex">
				<div class="weekday" v-for="day in weekdays" :class="{ visible: day.show }">{{day?.text}}</div>
			</div>
			<div class="squares grid grid-flow-col">
				<div
					class="square bg-white"
					:style="{
						'grid-row-start': square.index === 0 ? startAtWeekday + 1 : 'auto',
						'--bg-opacity': square.value
					}"
					:class="{ 
						'snap-start': square.index % 7 === 0,
						'last-week': square.lastWeek
					}"
					v-for="(square) in squares"
				><div class="w-full h-full pointer-events-none"></div></div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { subYears, startOfDay, addDays, differenceInCalendarISOWeeks, eachDayOfInterval, isAfter, endOfToday, startOfISOWeek, subDays, getMonth } from 'date-fns/esm';
import { formatBasicSortableDateKey, getWeekdayFromDate, getMonthNameShort } from '@/utils/date.utils.js';
import { computed, ref } from 'vue';
import { getItemsByDate } from '@/services/stats2/dates.js';

const props = defineProps({
	items: {
		type: Array,
		default: () => ([])
	}
});

const today = startOfDay(new Date());
const previousYear = addDays(subYears(today, 1), 1);
const _numWeeks = differenceInCalendarISOWeeks(today, previousYear);
const numWeeks = ref(_numWeeks);
const startAtWeekday = getWeekdayFromDate(previousYear) - 1;
console.log({ today, previousYear, weeks: numWeeks.value, startAtWeekday });

const interval = { start: previousYear, end: today };

const itemsByDate = computed(() => {
	return getItemsByDate(props.items);
})

const maxPlayed = computed(() => {
	const played = Object.values(itemsByDate.value).map(arr => arr.length);
	return Math.max(...played);
})

const squares = computed(() => {
	const days = eachDayOfInterval(interval);
	let weekI = 0;
	return days.map((d, i) => {
		const weekday = getWeekdayFromDate(d) - 1;
		if (i > 0 && weekday === 0) {
			weekI += 1;
		}
		const dateStr = formatBasicSortableDateKey(d);
		const numPlayed = itemsByDate.value?.[dateStr]?.length ?? 0;
		const value = numPlayed === 0 ? 0 : 0.2 + (numPlayed / maxPlayed.value * 0.8);

		return {
			date: d,
			dateStr,
			weekday,
			value,
			index: i,
			month: getMonthNameShort(d),
			weekColumn: weekI
		}
	})
})

const weekdays = [
	{}, { text: 'Di', show: true }, {}, { text: 'Do', show: true }, {}, { text: 'Za', show: true }, {}
];

const months = computed(() => {
	const res = [];
	let foundDates = new Set();
	squares.value.forEach((sq, idx) => {
		const { weekColumn, month, weekday, dateStr } = sq;
		const key = dateStr.slice(0, 8);
		if (foundDates.has(key)) return;
		if (idx !== 0 && weekday !== 0) return;
		foundDates.add(key);
		res.push({
			colStart: weekColumn + 1,
			colEnd: weekColumn + 3,
			name: month
		})
	});
	const lastWeekColumn = squares.value[squares.value.length - 1].weekColumn;
	const last = res[res.length - 1];
	if (last.colEnd > lastWeekColumn + 1) {
		const diff = last.colEnd - (lastWeekColumn + 1);
		last.colStart = (lastWeekColumn + 2) - 2;
		last.colEnd -= diff;
	}
	return res;
})

</script>

<style scoped>
.selected-day {
	direction: ltr;
}
.hmwrapper2 {
	direction: rtl;
	@apply pt-2 mb-2 pb-4;

	--grid-gap: 6px;
	--square-gap: 3px;
	--square-size: 1.125rem;

	--num-weeks: v-bind('numWeeks');
}
.hmwrapper {
	grid-template-areas: 
		"col1 row1"
		"col1 squares";
	grid-template-rows: auto auto;
	grid-template-columns: auto min-content;
	direction: ltr;
	@apply relative pl-0 pr-3;
	gap: var(--grid-gap);
}

.row-1 {
	grid-area: row1;
	@apply h-fit text-xs leading-relaxed align-middle box-content grid pt-2 text-gray-700;
	grid-template-rows: auto;
	grid-template-columns: repeat(var(--num-weeks, 52), var(--square-size));
	gap: var(--square-gap);
}

.column-1 {
	grid-area: col1;
	width: max-content;
	@apply bg-white sticky left-0 flex flex-col justify-end text-xs text-right px-2 mr-1 z-50 text-gray-600;
	gap: var(--square-gap);
}
.weekday {
	height: var(--square-size);
	@apply text-xs inline-block;
	width: fit-content;
	min-width: var(--square-size);
	max-width: calc(var(--square-size) * 2.5);
}
.weekday.visible {
	/* @apply bg-red-500/10; */
	
}

.squares {
	grid-area: squares;
	min-width: 0px;
	@apply bg-white;

	grid-template-rows: repeat(7, auto);
	grid-template-columns: repeat(v-bind(numWeeks), auto);

	gap: var(--square-gap);
}

.square {
	width: var(--square-size);
	height: var(--square-size);
	@apply bg-gray-200 rounded-sm relative;
	scroll-margin: var(--square-gap);
}

.square > * {
	@apply bg-purple-600;
	opacity: var(--bg-opacity, 1);
}
</style>