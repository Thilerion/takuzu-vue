<template>
	<section class="overflow-x-hidden max-w-full">
		<h2 class="text-lg font-medium pb-2">Heatmap</h2>
		<div class="heatmap-grid overflow-x-auto">
			<div
				class="weekday"
				v-for="dayStr in weekDays"
				:key="dayStr"
			>{{dayStr}}</div>
			<div
				class="timeline-day"
				:style="{
					'--amount': item.amount,
					'--ratio': item.ratio,
					'--sat': item.saturation,
					'--light': item.lightness,
					'--opacity': item.ratio <= 0.0001 ? 0 : (item.ratio * 0.2 + 0.8)
				}"
				v-for="item in dateRatios"
				:key="item.dateStr"
			><div class="timeline-color"></div></div>
		</div>
	</section>
</template>

<script>
import { formatBasicDateSortable } from "@/utils/date.utils";
import { differenceInCalendarDays, isSameDay, startOfDay, addDays, compareAsc, startOfWeek, format, startOfMonth, startOfTomorrow, getISODay, addWeeks } from 'date-fns';

const firstDOW = startOfWeek(new Date(), {
	weekStartsOn: 1
});
const shortWeekDaysArray = Array.from(Array(7)).map((e, i) => format(addDays(firstDOW, i), 'EEEEEE'));

export default {
	props: {
		items: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			weekDays: [...shortWeekDaysArray],

			currentDate: startOfDay(new Date()),
			weeksToShow: 12,

			datesWithItems: [],
			allDates: [],
			emptyTimelineStart: 0,
		}
	},
	computed: {
		firstDate() {
			const current = this.currentDate;
			const weeksAgo = addWeeks(current, this.weeksToShow * -1);
			return addDays(startOfWeek(weeksAgo), 1);
		},
		transformedItems() {
			return this.items.map(item => {
				const date = new Date(item.date);
				const dayStartDate = startOfDay(date);
				return {
					...item,
					timestamp: item.date,
					date,
					dayStartDate,
					dateKey: formatBasicDateSortable(dayStartDate)
				}
			})
		},
		timelineDays() {
			const start = this.firstDate;
			const amount = differenceInCalendarDays(this.currentDate, this.firstDate) + 1;
			return Array(amount).fill(null).map((_val, idx) => addDays(start, idx));
		},
		timelineValues() {
			const objResult = this.transformedItems.reduce((acc, item) => {
				const { dateKey } = item;
				if (acc[dateKey] == null) {
					acc[dateKey] = {
						timeElapsed: 0,
						amount: 0,
						date: item.dayStartDate,
						dateKey
					}
				}
				acc[dateKey].amount += 1;
				acc[dateKey].timeElapsed += item.timeElapsed;
				return acc;
			}, {});

			for (const dateKey of Object.keys(objResult)) {
				const item = objResult[dateKey];
				const {amount, timeElapsed} = item;
				const value = amount + (amount * (Math.sqrt(timeElapsed / 10000)));
				item.value = value;
			}
			return objResult;
		},
		maxValue() {
			return Math.max(...Object.values(this.timelineValues).map(item => item.value));
		},
		formattedAllDates() {
			return this.allDates.map(date => {
				return formatBasicDateSortable(date);
			})
		},
		dateRatios() {
			const max = this.maxValue;
			return this.timelineDays.map(d => {
				const dateStr = formatBasicDateSortable(d);
				try {
					const n = this.timelineValues[dateStr].value;
					const result = {
						ratio: null,
						amount: n,
						dateStr,
						saturation: 0.5,
						lightness: 0.9
					};
					if  (n === 0) {
						result.ratio = 0;
						return result;
					}
					const ratio = n / max;
					result.ratio = (ratio / 10 * 8) + 0.2;

					result.saturation += (result.ratio * 0.5);
					result.lightness -= (result.ratio * 0.5);

					return result;
				} catch {
					return {
						ratio: 0,
						amount: 0,
						dateStr,
						saturation: 0,
						lightness: 1
					};
				}
			})
		},
		itemsByDate() {
			const dates = [...this.datesWithItems];
			const result = {};
			for (let date of dates) {
				const dateStr = formatBasicDateSortable(date);
				result[dateStr] = 0;
			}
			for (let item of this.items) {
				const startDate = startOfDay(new Date(item.date));
				const dateStr = formatBasicDateSortable(startDate);
				result[dateStr] += 1;
			}
			return result;
		},
		max() {
			return Math.max(...Object.values(this.itemsByDate));
		}
	},
	methods: {
		initializeTimelineData() {
			const itemDates = [...this.items.reduce((acc, val) => {
				const startDate = startOfDay(new Date(val.date));
				const dateStr = formatBasicDateSortable(startDate);
				acc.add(dateStr);
				return acc;
			}, new Set())];
			const dates = itemDates.map(dateStr => new Date(dateStr));
			this.datesWithItems = dates.sort((a, b) => compareAsc(a, b));

			const startAt = startOfMonth(dates[0]);
			const stopAfter = this.currentDate;
			console.log(startAt, stopAfter);

			const allDates = [];
			let curDate = startOfDay(startAt);
			allDates.push(curDate);
			while (!isSameDay(curDate, stopAfter)) {
				curDate = addDays(curDate, 1)
				allDates.push(curDate);
			}
			this.allDates = allDates;
			console.log(allDates);

			this.emptyTimelineStart = getISODay(startAt);
		}
	},
	beforeMount() {
		this.initializeTimelineData();
	}
};
</script>

<style lang="postcss" scoped>
.heatmap-grid {
	display: grid;
	grid-template-rows: repeat(7, auto);
	grid-auto-columns: 21px;
	grid-auto-flow: column;
	gap: 3px;
	height: auto;
	@apply px-2;
}
.weekday {
	grid-column: 1 / span 1;
	@apply text-xxs flex items-center text-left leading-none;
}

.timeline-day {
	@apply border text-xxs overflow-hidden relative bg-white bg-opacity-80 border-gray-200 rounded-sm;
	width: 21px;
	height: 21px;
}
.timeline-color {
	@apply absolute inset-0;
	background-color: hsla(123, calc(var(--sat) * 100%), calc(var(--light) * 100%), var(--opacity));
}
</style>