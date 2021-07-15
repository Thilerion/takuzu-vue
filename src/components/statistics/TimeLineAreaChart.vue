<template>
	<div class="area-chart relative w-full px-4 py-2 h-72">
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
		chartId: {
			type: String,
		},
		dataset: {
			type: Array,
			required: true
		}
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
						label: 'Puzzles solved',
						fill: 'stack',
						backgroundColor: getComputedStyle(document.querySelector('.area-chart')).getPropertyValue('--fill-color')
					}]
				},
				options: {
					...chartOptions.options,
					plugins: {
						legend: { display: false },
						title: {
							display: true,
							text: 'Total puzzles solved over time'
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
.area-chart {
	--fill-color: #0ea4e99a;
}
</style>