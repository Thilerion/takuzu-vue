<template>
	<div class="relative max-w-full px-1">
		<canvas :id="id"></canvas>
	</div>
</template>

<script>
import { Chart } from 'chart.js';

const chartOptions = {
	type: 'pie'
}

export default {
	props: {
		chartId: {
			type: String,
		},
		dataset: {
			type: Array,
			required: true
		},
		datasetLabel: String,
		title: String,
		labels: Array,
		backgroundColor: Array
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
				type: 'pie',
				data: {
					labels: this.labels,
					datasets: [{
						data: this.dataset,
						label: this.datasetLabel,
						backgroundColor: this.backgroundColor
					}]
				},
				options: {
					plugins: {
						legend: { position: 'top' },
						title: {
							display: this.title != null,
							text: this.title
						}
					},
					responsive: true,
					maintainAspectRatio: false,
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