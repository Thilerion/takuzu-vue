<template>
	<div>
		<BarChart
			chart-id="barChart"
			:labels="labels"
			:dataset="difficultyCounts"
			:dataset-label="'Puzzles solved'"
		/>
		<TimeLineChart
			:dataset="solvedPerDay"
		/>
		<TimeLineAreaChart
			:dataset="totalSolvedByDay"
		/>
	</div>
</template>

<script>
import BarChart from './BarChart.vue'
import TimeLineChart from './TimeLineChart.vue'
import TimeLineAreaChart from './TimeLineAreaChart.vue'

import { parse } from 'date-fns';

export default {
	components: {
		BarChart,
		TimeLineChart,
		TimeLineAreaChart,
	},
	props: {
		difficultyCounts: {
			type: Array,
			required: true
		},
		dailyStats: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			labels: ['1*', '2*', '3*', '4*', '5*'],
		}
	},
	computed: {
		solvedPerDay() {
			return this.dailyStats.map(obj => {
				const { amount, date } = obj;
				const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
				return { x: parsedDate, y: amount};
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