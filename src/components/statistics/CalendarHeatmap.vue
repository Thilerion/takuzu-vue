<template>
	<section class="overflow-x-hidden max-w-full bg-white py-4">
		<h2 class="text-lg font-medium pb-2">Heatmap</h2>
		<div class="heatmap-grid overflow-x-auto">
			<div
				class="weekday"
				v-for="dayStr in weekDays"
				:key="dayStr"
			>{{dayStr}}</div>
			<div
				v-for="item in dateRangeColors"
				:key="item.dateStr"
				class="timeline-item"
				:class="{ empty: item.data.totalPlayed < 1, selected: selected && selected.dateStr === item.dateStr }"
				:style="{ '--color': item.color }"
				@click="selectHeatmapDate(item.data)"
			>
			</div>
		</div>
		<div class="text-xs h-12 flex flex-col justify-evenly px-8">
			<template v-if="selected">
			<div>{{selected.dateStr}}</div>
			<div v-if="selected.totalPlayed">Played: {{selected.totalPlayed}}, total time: {{selected.totalTimeFormatted}}</div>
			<div v-else>No puzzles played this day</div>
			</template>
		</div>
	</section>
</template>

<script>
import { formatBasicSortableDateKey, getDateRange, timeFormatter } from "@/utils/date.utils";
import { differenceInCalendarDays, isSameDay, startOfDay, addDays, compareAsc, startOfWeek, format, startOfMonth, startOfTomorrow, getISODay, subWeeks } from 'date-fns';

const firstDOW = startOfWeek(new Date(), {
	weekStartsOn: 1
});
const shortWeekDaysArray = Array.from(Array(7)).map((e, i) => format(addDays(firstDOW, i), 'EEEEEE'));

export default {
	props: {
		dailyItems: {
			type: Array,
			required: true,
		}
	},
	data() {
		return {			
			currentDate: startOfDay(new Date()),
			weeksToShow: 12,
			dateRange: [],
			colorScale: ['#cbdef1', '#aab7d8', '#a1a2cc', '#9b8cc1', '#9775b7', '#955bac', '#943da2', '#940098'],

			weekDays: [...shortWeekDaysArray],
			selected: null,
		}
	},
	computed: {
		firstDate() {
			const current = this.currentDate;
			const weeksAgo = subWeeks(current, this.weeksToShow);
			return addDays(startOfWeek(weeksAgo), 1);
		},
		dateRangeStr() {
			return this.dateRange.map(date => formatBasicSortableDateKey(date));
		},
		dailyItemsByDateStr() {
			return this.dailyItems.reduce((acc, val) => {
				const key = val.groupData.dateStr;
				acc[key] = val;
				return acc;
			}, {});
		},
		timelineDaysData() {
			return this.dateRangeStr.map(dateStr => {
				if (this.dailyItemsByDateStr[dateStr]) {
					return this.dailyItemsByDateStr[dateStr];
				} else {
					return {
						totalPlayed: 0,
						groupData: { dateStr }
					}
				}
			})
		},
		dateStrMappedToRatio() {
			const timePlayedList = this.dailyItems.map(item => item.totalTime);
			const totalPlayedList = this.dailyItems.map(item => item.totalPlayed);
			const maxTimePlayed = Math.max(...timePlayedList);
			const maxTotalPlayed = Math.max(...totalPlayedList);

			const withScores = this.dailyItems.map(item => {
				const { totalPlayed, groupData, totalTime } = item;
				if (!totalPlayed) { 
					return { score: 0, groupData };
				}
				const timeScore = totalTime / maxTimePlayed * 100;
				const playedScore = totalPlayed / maxTotalPlayed * 100;

				const score = ((playedScore * playedScore) + (timeScore * 1.4 * timeScore));
				return { groupData, score: Math.pow(score, 1 / 1.2) };
			})
			const scores = withScores.map(item => item.score).filter(val => val != 0);
			const max = Math.max(...scores);
			const min = Math.min(...scores);
			const average = scores.reduce((acc, val) => acc + val, 0) / scores.length;

			const diffBelow = average - min;
			const diffAbove = max - average;

			const toRatio = (score) => {
				let base;
				if (score < average) {
					base = (score / diffBelow) / 2;
				} else if (score === average) {
					base = 0.5;
				} else {
					base = (((score - average) / diffAbove) / 2) + 0.5;
				}
				return Math.round(base * 100) / 100;
			}

			return withScores.reduce((acc, val) => {
				const { groupData, score } = val;
				const ratio = toRatio(score);
				const { dateStr } = groupData;
				acc[dateStr] = ratio;
				return acc;
			}, {});
		},
		colorScaleAsMinRatio() {
			const length = this.colorScale.length;
			return this.colorScale.map((color, idx) => {
				const minRatio = idx > 0 ? (idx) / length : 0;
				return { color, minRatio }
			});
		},
		dateRangeColors() {
			const colorScaleRatios = [...this.colorScaleAsMinRatio].reverse();
			const dateRatios = this.dateStrMappedToRatio;

			return this.timelineDaysData.map(val => {
				const { totalPlayed = 0, totalTime = 0, groupData } = val;
				const { dateStr } = groupData;

				const result = { dateStr, color: null, ratio: null, data: {
					totalPlayed, totalTime, totalTimeFormatted: this.msToMinSec(totalTime),
					dateStr
				}}

				if (!totalPlayed) return result;

				const ratio = dateRatios[dateStr] ?? -1;

				if (ratio < 0) return result;

				for (let { color, minRatio } of colorScaleRatios) {
					if (ratio >= minRatio) {
						result.color = color;
						return result;
					}
				}

				console.warn({ val, ratio });
				return result;
			})
		},
	},
	methods: {
		getAllDatesInTimelineRange() {
			const firstDate = this.firstDate;
			const lastDate = this.currentDate;
			const dateRange = getDateRange(firstDate, lastDate);
			this.dateRange = dateRange;
		},
		msToMinSec: timeFormatter({ padMinutes: false }),
		selectHeatmapDate(data) {
			const { dateStr } = data;
			if (this.selected != null && this.selected.dateStr === dateStr) {
				this.selected = null;
			} else {
				this.selected = data;
			}
		}
	},
	beforeMount() {
		this.getAllDatesInTimelineRange();
	}
};
</script>

<style lang="postcss" scoped>
.heatmap-grid {
	display: grid;
	grid-template-rows: repeat(7, auto);
	grid-auto-columns: 21px;
	grid-auto-flow: column;
	gap: 2px;
	height: auto;
	@apply px-2;
}
.weekday {
	grid-column: 1 / span 1;
	@apply text-xxs flex items-center text-left leading-none;
}

.timeline-item {
	@apply text-xxs overflow-hidden relative bg-opacity-80 flex text-center justify-center items-center text-white;
	width: 21px;
	height: 21px;
	background-color: var(--color);
}
.timeline-item.selected {
	@apply border-2 border-gray-700;
}
.timeline-item.empty {
	@apply bg-gray-100;
}
.timeline-color {
	@apply absolute inset-0;
	background-color: hsla(123, calc(var(--sat) * 100%), calc(var(--light) * 100%), var(--opacity));
}
</style>