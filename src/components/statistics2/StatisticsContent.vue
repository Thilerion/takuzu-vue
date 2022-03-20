<template>
	<div>
		<StatsActivity />
		<div>
			<StatsOverview />
		</div>
	</div>
</template>

<script setup>
import StatsOverview from './StatsOverview.vue';
import { useStatisticsStore2 } from '@/stores/statistics2.js';
import { provide, toRef } from 'vue';
import StatsActivity from './StatsActivity.vue';

const statsStore = useStatisticsStore2();
const items = toRef(statsStore, 'historyItems');

provide('historyItems', items);

</script>

<style scoped>

</style>