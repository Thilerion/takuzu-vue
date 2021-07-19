<template>
	<div>
		<PieChart
			class="mt-2 mx-4 bg-white rounded pt-2 pb-6 shadow-lg"
			chart-id="pie-chart-difficulty"
			:labels="difficultyLabels"
			:dataset="difficultyCounts"
			:dataset-label="'Difficulty'"
			:background-color='[ "#FFAB05", "#6050DC","#FF6B45", "#D52DB7", "#FF2E7E"]'
			title="Puzzles solved by difficulty"
		/>
		<PieChart
		class="mt-6 mx-4 bg-white rounded pt-2 pb-6 shadow-lg mb-4"
			chart-id="pie-chart-boardtype"
			:labels="boardTypeLabels"
			:dataset="boardTypeCountsData"
			:dataset-label="'Board type'"
			:background-color='["#FFAB05", "#6050DC", "#FF2E7E"]'
			title="Puzzles solved by puzzle type"
		/>
		<TimeLineChart
			chart-id="timeline-solved-daily"
			:dataset="solvedPerDay"
			dataset-label="Puzzles solved"
			title="Puzzles solved per day"
			hue="305"
		/>
		<TimeLineChart
			chart-id="timeline-time-daily"
			:dataset="timeSpentPerDay"
			dataset-label="Time played"
			title="Time played per day"
			hue="199"
		/>
		<TimeLineChart
			chart-id="timeline-total-solved"
			is-area-chart
			:dataset="totalSolvedByDay"
			dataset-label="Puzzles solved"
			title="Total puzzles solved over time"
			hue="140"
		/>
	</div>
</template>

<script>
import Chart from 'chart.js/auto';
import TimeLineChart from './TimeLineChart.vue'
import PieChart from './PieChart.vue'

import { parse } from 'date-fns';
import { boardTypes, DIFFICULTY_LABELS } from '@/config';
import { getDateRange } from '@/utils/date.utils';

export default {
	components: {
		TimeLineChart,
		PieChart,
	},
	props: {
		difficultyCounts: {
			type: Array,
			required: true
		},
		boardTypeCounts: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			labels: ['1*', '2*', '3*', '4*', '5*'],
			difficultyLabels: Object.values(DIFFICULTY_LABELS),

			boardTypeLabels: [
				boardTypes.NORMAL,
				boardTypes.RECT,
				boardTypes.ODD
			],
		}
	},
	computed: {
		dateSummaries() {
			return this.$store.getters['statsData/dateSummaries'];
		},
		dateSummariesFilledFromRange() {
			const firstDate = this.dateSummaries[0].groupData.date;
			const lastDate = new Date();

			const dateRange = getDateRange(firstDate, lastDate);
			console.log(dateRange);

			const result = [];
			const dateSummaries = [...this.dateSummaries].reverse();

			let nextSumm = dateSummaries[dateSummaries.length - 1];

			for (let i = 0; i < dateRange.length; i++) {
				const date = dateRange[i];
				if (nextSumm.groupData.distanceFromFirst === i) {
					const { totalPlayed, totalTime } = dateSummaries.pop();
					result.push({ date, totalPlayed, totalTime });
					nextSumm = dateSummaries[dateSummaries.length - 1];
				} else {
					result.push({ date, totalPlayed: 0, totalTime: 0 });
				}
			}
			return result;
		},
		boardTypeCountsData() {
			return this.boardTypeLabels.map(typeName => {
				return this.boardTypeCounts[typeName] || 0;
			})
		},
		solvedPerDay() {
			const maxDisplayed = 60;
			const arr = [...this.dateSummariesFilledFromRange].slice(maxDisplayed * -1);
			return arr.map(({ date, totalPlayed }) => {
				return { x: date, y: totalPlayed};
			});
		},
		timeSpentPerDay() {
			const maxDisplayed = 60;
			const arr = [...this.dateSummariesFilledFromRange].slice(maxDisplayed * -1);
			return arr.map(({ date, totalTime }) => {
				const minutesPlayed = totalTime / 60 / 1000;
				const minutesRounded = Math.round(minutesPlayed * 100) / 100;
				return { x: date, y: minutesRounded};
			});
		},
		totalSolvedByDay() {
			const result = [];

			let acc = 0;
			for (let obj of this.solvedPerDay) {
				const { x, y} = obj;
				const item = { x, y: y + acc };
				acc += y;
				result.push(item);
			}
			return result;
		}
	}
};
</script>

<style lang="postcss" scoped>

</style>