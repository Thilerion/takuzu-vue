<template>
	<div class="relative w-full px-4 py-2 h-72">
		<canvas :id="id"></canvas>
	</div>
</template>

<script>
import { Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';

const chartOptions = {
	type: 'line',
	options: {
		scales: {
			x: {
				type: 'timeseries',
				time: {
					unit: 'day',
					tooltipFormat: 'EEEE d MMMM yyyy',
					minUnit: 'day'
				}
			}
		},
	}
}

export default {
	props: {
		isAreaChart: Boolean,
		chartId: {
			type: String,
		},
		dataset: {
			type: Array,
			required: true
		},
		datasetLabel: String,
		title: String
	},
	data() {
		return {
			id: null,
			instance: null,
		}
	},
	beforeMount() {
		if (this.chartId != null) {
			this.id = this.chartId;
		} else {
			const rnd = `00000${Math.floor(Math.random() * 1e5)}`.slice(-5);
			this.id = `line-chart-${rnd}`;
		}
	},
	mounted() {
		this.instance = new Chart(this.id, 
			{
				...chartOptions,
				data: {
					datasets: [{
						data: this.dataset,
						label: this.datasetLabel,
						fill: this.isAreaChart ? 'stack' : undefined,
						backgroundColor: '#0ea4e99a',
					}]
				},
				options: {
					...chartOptions.options,
					plugins: {
						legend: { display: false },
						title: {
							display: this.title != null,
							text: this.title
						}
					},
					responsive: true,
					maintainAspectRatio: false,
					interaction: {
						intersect: false,
						mode: 'nearest',
						axis: 'x'
					}
				},
			},
		)
	},
	unmounted() {
		this.instance?.destroy();
		this.instance = null;
	},
	updated() {
		if (this.instance) {
			this.instance.update();
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>