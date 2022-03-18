<template>
		<div class="heatmap-scroll-wrapper overflow-x-auto overflow-y-visible w-full mx-auto h-fit snap-both snap-proximity bg-white">

		<div class="heatmap-wrapper grid w-fit snap-end mx-auto">
			<div class="months relative">
				<div class="month"
					v-for="month in months"
					:style="{
						'grid-column': `${month.colStart} / span 3`,
						'grid-row': '1 / span 1'
					}"
				>{{month.name}}</div>
			</div>
			<div class="weekdays flex">
				<div class="weekday" v-for="day in weekdays">
					<span v-if="day.show">{{day.name}}</span>
				</div>
			</div>
			<div class="squares grid grid-flow-col">
				<div
					class="square bg-white"
					:style="{
						'grid-row-start': square.index === 0 ? startAtWeekday + 1 : 'auto',
						'--bg-opacity': square.value
					}"
					:class="{ 'snap-start': square.index % 7 === 0 }"
					v-for="(square) in squares"
				><div class="w-full h-full pointer-events-none"></div></div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { subYears, startOfDay, addDays, differenceInCalendarISOWeeks, eachDayOfInterval } from 'date-fns/esm';
import { formatBasicSortableDateKey, getWeekdayFromDate, getMonthNameShort, getWeekDaysShort } from '@/utils/date.utils.js';
import { computed } from 'vue';
import { getItemsByDate } from '@/services/stats2/dates.js';

const props = defineProps({
	items: {
		type: Array,
		default: () => ([])
	}
});
const itemsByDate = computed(() => {
	return getItemsByDate(props.items);
})

// heatmap data
const { interval, numWeeks } = createHeatmapRange();
const squares = computed(() => createHeatmapSquares(itemsByDate, { interval }));
const startAtWeekday = getWeekdayStart(interval);


// grid weekday column and months row
const weekdays = useWeekdays();
const months = computed(() => useMonthsList(squares));

</script>

<script>

const useWeekdays = () => {
	const weekdays = getWeekDaysShort();
	const shown = [1, 3, 5];
	return weekdays.map((name, i) => {
		return {
			name,
			show: shown.includes(i)
		}
	})
}

const useMonthsList = (squares) => {
	const res = [];
	const foundMonths = new Set();

	squares.value.forEach((sq, idx) => {
		const { weekColumn, month, weekday, dateStr } = sq;
		const key = dateStr.slice(0, 8);
		if (foundMonths.has(key)) return;
		if (idx !== 0 && weekday !== 0) return;
		foundMonths.add(key);

		res.push({
			colStart: weekColumn + 1,
			colEnd: weekColumn + 3,
			name: month
		})
	})

	const lastWeekColumn = squares.value[squares.value.length - 1].weekColumn;
	const last = res[res.length - 1];
	if (last.colEnd > lastWeekColumn + 1) {
		const diff = last.colEnd - (lastWeekColumn + 1);
		last.colStart = (lastWeekColumn + 2) - 2;
		last.colEnd -= diff;
	}
	return res;
}

const createHeatmapRange = () => {
	const today = startOfDay(new Date());
	const previousYear = addDays(subYears(today, 1), 1);
	const numWeeks = differenceInCalendarISOWeeks(today, previousYear);

	const interval = {
		start: previousYear,
		end: today
	};

	return {
		numWeeks,
		interval
	}
}

const getWeekdayStart = (interval) => getWeekdayFromDate(interval.start) - 1;

const createHeatmapSquares = (itemsByDate, { interval }) => {
	const played = Object.values(itemsByDate.value).map(arr => arr.length);
	const maxPlayed = Math.max(...played);

	const days = eachDayOfInterval(interval);
	const squares = [];

	for (let i = 0, week = 0; i < days.length; i++) {
		const d = days[i];
		const weekday = getWeekdayFromDate(d) - 1;
		if (i > 0 && weekday === 0) week += 1;

		const dateStr = formatBasicSortableDateKey(d);
		const numPlayed = itemsByDate.value?.[dateStr]?.length ?? 0;
		const scaleValue = numPlayed === 0 ? 0 : 0.2 + (numPlayed / maxPlayed * 0.8);

		squares.push({
			date: d,
			dateStr,
			weekday,
			value: scaleValue,
			index: i,
			month: getMonthNameShort(d),
			weekColumn: week
		})
	}

	return squares;
}

</script>

<style scoped>
.heatmap-scroll-wrapper {
	direction: rtl;
	@apply pt-2 mb-2 pb-4;

	--grid-gap: 6px;
	--square-gap: 3px;
	--square-size: 1.125rem;

	--num-weeks: v-bind('numWeeks');
}
.heatmap-wrapper {
	grid-template-areas: 
		"weekdays months"
		"weekdays squares";
	grid-template-rows: auto auto;
	grid-template-columns: auto min-content;
	direction: ltr;
	@apply relative pl-0 pr-3;
	gap: var(--grid-gap);
}

.months {
	grid-area: months;
	@apply h-fit text-xs leading-relaxed align-middle box-content grid pt-2 text-gray-700;
	grid-template-rows: auto;
	grid-template-columns: repeat(var(--num-weeks, 52), var(--square-size));
	gap: var(--square-gap);
}

.weekdays {
	grid-area: weekdays;
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