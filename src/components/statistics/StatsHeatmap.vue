<template>
	<div
		class="heatmap-scroll-wrapper overflow-x-auto overflow-y-visible w-full mx-auto h-fit snap-both snap-proximity bg-white">

		<div class="heatmap-wrapper grid w-fit snap-end mx-auto">
			<div class="months relative">
				<div class="month" v-for="(month, idx) in months" :key="`${idx}${month}`" :style="{
					'grid-column': `${month.colStart} / span 3`,
					'grid-row': '1 / span 1'
				}">{{ month.name }}</div>
			</div>
			<div class="weekdays flex">
				<div class="weekday" v-for="day in weekdays" :key="day.name">
					<span v-if="day.show">{{ day.name }}</span>
				</div>
			</div>
			<div class="squares grid grid-flow-col">
				<div class="square bg-white" @click="toggleSelectedSquare(square.dateStr, square)"
					:data-level="dateToScaleLevelMap.get(square.dateStr) ?? 0" :style="{
						'grid-row': `${square.weekday + 1} / span 1`,
						'grid-column': `${square.weekColumn + 1} / span 1`,
					}" :class="{
	'snap-start': square.index % 7 === 0,
	'selected': square.dateStr === selectedSquare?.dateStr
}" v-for="(square) in squares" :key="square.index">
					<div class="w-full h-full pointer-events-none"></div>
				</div>
			</div>
		</div>
	</div>
	<div class="w-full" v-if="selectedDateValues != null">
		<div class="flex flex-row gap-4 items-center justify-between text-xs max-w-md mx-auto px-3 py-1">
			<div>{{ selectedDateValues.date }}</div>
			<template v-if="selectedDateValues.played > 0">
				<div>{{ selectedDateValues.played }} puzzles</div>
				<div>playtime: {{ formatTime(selectedDateValues.time) }}</div>
			</template>
			<template v-else>
				<div>No puzzles played</div>
				<div></div>
			</template>
		</div>
	</div>
</template>

<script setup>
import { getItemsByDate } from '@/services/stats/dates';
import { formatBasicSortableDateKey, getMonthNameShort, getWeekdayFromDate, getWeekdayNamesShort, timeFormatter } from '@/utils/date.utils.js';
import { addDays, differenceInCalendarISOWeeks, eachDayOfInterval, endOfDay, isWithinInterval, startOfDay, subYears } from 'date-fns';
import { computed, inject, ref } from 'vue';
import { calculateScoresByDate, getValueWithinRange, mapScoreToArray } from './heatmap-data.js';

const historyItems = inject('historyItems', () => [], true);
const formatTime = timeFormatter({
	padMinutes: false
});
// heatmap data
const { interval, numWeeks } = createHeatmapRange();

const itemsByDate = computed(() => {
	// cutoff items so none before heatmap interval are processed
	const heatmapInclusiveInterval = {
		start: startOfDay(interval.start),
		end: endOfDay(interval.end)
	};
	const items = historyItems.value.filter(item => isWithinInterval(item.date, heatmapInclusiveInterval));
	return getItemsByDate(items);
})

const scoresByDate = computed(() => {
	const items = itemsByDate.value;
	return calculateScoresByDate(items);
})

const allSortedScores = computed(() => {
	// top 2 percent is set as max and remove from equation, to prevent very high outliers from making all other cells light
	// then dataset split in half, with lower half getting 
	const byDate = Object.entries(scoresByDate.value).map((val) => {
		const [dateStr, obj] = val;
		return { ...obj, dateStr };
	}).sort((a, b) => a.combinedScore - b.combinedScore);

	if (byDate.length < 60) {
		return byDate;
	}

	const upTo97Idx = Math.round(0.97 * byDate.length);
	const upTo97 = byDate.slice(0, upTo97Idx);

	const midPoint = Math.round(upTo97.length / 2);
	const lowerHalf = upTo97.slice(0, midPoint);
	const upperHalf = upTo97.slice(midPoint);

	const minLower = lowerHalf[0].combinedScore;
	const maxLower = lowerHalf.at(-1).combinedScore;

	const minUpper = upperHalf[0].combinedScore;
	const maxUpper = upperHalf.at(-1).combinedScore;

	const a = (score) => score * 0.35;
	const b = (score) => score * 0.65 + 0.35;

	const rescaledLower = lowerHalf.map(obj => {
		const score2 = getValueWithinRange(minLower, obj.combinedScore, maxLower);
		return { ...obj, combinedScore: a(score2) };
	})
	const rescaledUpper = upperHalf.map(obj => {
		const score2 = getValueWithinRange(minUpper, obj.combinedScore, maxUpper);
		return { ...obj, combinedScore: Math.min(b(score2), 1) };
	})

	const from97 = byDate.slice(upTo97Idx).map(val => {
		return { ...val, combinedScore: 1 };
	})
	const resultArr = [
		...rescaledLower,
		...rescaledUpper,
		...from97
	];
	return resultArr;
})

const dateToScaleLevelMap = computed(() => {
	const map = new Map();
	const levelArr = [1, 2, 3, 4, 5];
	for (const { dateStr, combinedScore } of allSortedScores.value) {
		const level = mapScoreToArray(combinedScore, levelArr);
		map.set(dateStr, level);
	}
	return map;
})

const squares = computed(() => {
	return createHeatmapSquares(itemsByDate, { interval });
})

// grid weekday column and months row
const weekdays = useWeekdays();
const months = computed(() => useMonthsList(squares));

const selectedSquare = ref(null);
const toggleSelectedSquare = (dateStr, square) => {
	if (selectedSquare.value?.dateStr === dateStr) {
		selectedSquare.value = null;
	} else {
		selectedSquare.value = square;
	}
}
const selectedDateValues = computed(() => {
	if (selectedSquare.value == null) return null;
	const data = scoresByDate.value[selectedSquare.value.dateStr] ?? {};
	const { played = 0, time = 0 } = data;
	return {
		played,
		time,
		date: selectedSquare.value.dateStr
	}
})

</script>

<script>

const useWeekdays = () => {
	const weekdays = getWeekdayNamesShort();
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

const createHeatmapCells = interval => {
	let weekIndex = 0;
	return eachDayOfInterval(interval).map((date, index) => {
		const weekday = getWeekdayFromDate(date) - 1;
		// index 0 is always first week in range; else if monday it is the next week
		if (index > 0 && weekday === 0) weekIndex += 1;
		const dateStr = formatBasicSortableDateKey(date);

		return {
			index,
			weekday,
			weekColumn: weekIndex,
			month: getMonthNameShort(date),

			date,
			dateStr,
		}
	})
}

const createHeatmapSquares = (_itemsByDate, { interval }) => {
	const cells = createHeatmapCells(interval);
	return cells;
}

</script>

<style scoped>
.heatmap-scroll-wrapper {
	direction: rtl;
	@apply pt-2 pb-6;

	--grid-gap: 6px;
	--square-gap: 2px;
	--square-size: 1.25rem;

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
	@apply h-fit text-xxs leading-relaxed align-middle box-content grid pt-2 text-gray-700;
	grid-template-rows: auto;
	grid-template-columns: repeat(var(--num-weeks, 52), var(--square-size));
	gap: var(--square-gap);
}

.weekdays {
	grid-area: weekdays;
	width: max-content;
	@apply bg-white sticky left-0 flex flex-col justify-end text-xxs text-right w-6 z-50 text-gray-600/80;
	gap: var(--square-gap);
}

.weekday {
	height: var(--square-size);
	@apply text-xxs flex items-center justify-end pr-1;
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

	--shadow-blur: clamp(2px,
			calc(var(--square-size) * 0.2),
			0.4rem);
}

.square.selected {
	@apply ring-2 ring-black ring-inset;
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

.square {
	width: var(--square-size);
	height: var(--square-size);
	@apply rounded-[1px] relative;
	scroll-margin: var(--square-gap);
	background-color: var(--bg);
	box-shadow: inset 0 0 var(--shadow-blur) 0 rgb(0 0 0 / var(--shadow-opacity));
}
</style>