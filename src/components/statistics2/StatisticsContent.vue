<template>
	<div>
		<div>
			<StatsHeatmap
				:items="items"
			/>
		</div>
		<div>
			<StatsOverview />
		</div>
	</div>
</template>

<script setup>
import StatsOverview from './StatsOverview.vue';
import StatsHeatmap from './StatsHeatmap.vue';
import { useStatisticsStore2 } from '@/stores/statistics2.js';
import { toRef } from 'vue';

const statsStore = useStatisticsStore2();
const items = toRef(statsStore, 'historyItems');

</script>

<style scoped>

</style>