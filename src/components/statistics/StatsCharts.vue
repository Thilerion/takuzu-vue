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
			:dataset="solvedPerDay"
			dataset-label="Puzzles solved"
			title="Puzzles solved per day"
			hue="305"
		/>
		<TimeLineChart
			:dataset="timeSpentPerDay"
			dataset-label="Time played"
			title="Time played per day"
			hue="199"
		/>
		<TimeLineChart
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
		dailyStats: {
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
		boardTypeCountsData() {
			return this.boardTypeLabels.map(typeName => {
				return this.boardTypeCounts[typeName] || 0;
			})
		},
		solvedPerDay() {
			return this.dailyStats.map(obj => {
				const { amount, date } = obj;
				const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
				return { x: parsedDate, y: amount};
			})
		},
		timeSpentPerDay() {
			return this.dailyStats.map(obj => {
				const { totalTime, date } = obj;
				const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
				const minutesPlayed = totalTime / 60 / 1000;
				const minutesRounded = Math.round(minutesPlayed * 100) / 100;
				return { x: parsedDate, y: minutesRounded };
			})
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