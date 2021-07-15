<template>
	<div>
		<BarChart
			chart-id="barChart"
			:labels="labels"
			:dataset="difficultyCounts"
			:dataset-label="'Puzzles solved'"
		/>
	</div>
</template>

<script>
import BarChart from './BarChart.vue'

export default {
	components: {
		BarChart
	},
	props: {
		difficultyCounts: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			labels: ['1*', '2*', '3*', '4*', '5*'],
		}
	},
};
</script>

<style lang="postcss" scoped>
	
</style>