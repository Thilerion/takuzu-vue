<template>
	<div class="relative w-full px-4 py-2">
		<canvas :id="chartId"></canvas>
	</div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
	props: {
		chartId: {
			type: String,
			required: true
		},
		labels: {
			type: Array,
			required: true
		},
		dataset: {
			type: Array,
			required: true
		},
		datasetLabel: {
			type: String
		}
	},
	data() {
		return {
			instance: null
		}
	},
	mounted() {
		this.instance = new Chart(this.chartId, {
			type: 'bar',
			data: {
				labels: this.labels,
				datasets: [{
					label: this.datasetLabel,
					data: this.dataset,
					backgroundColor: ['purple', 'green', 'yellow', 'red', 'blue']
				}]
			},
			options: {
				interaction: {
					intersect: false, // to be able to click on small bars
				},
				plugins: {
					legend: { display: false },
					title: {
						display: true,
						text: 'Amount of puzzles solved by difficulty'
					}
				},				
			}
		})
	},
	beforeUnmount() {
		this.instance?.destroy();
	}
};
</script>

<style lang="postcss" scoped>
	
</style>