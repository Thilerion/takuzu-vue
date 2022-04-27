<template>
	<div class="space-y-4">
		<StatsOverview />
		<StatsActivity />
	</div>
</template>

<script setup>
import StatsOverview from './StatsOverview.vue';
import { useStatisticsStore } from '@/stores/statistics.js';
import { provide, toRef } from 'vue';
import StatsActivity from './StatsActivity.vue';

const statsStore = useStatisticsStore();
const items = toRef(statsStore, 'historyItems');

provide('historyItems', items);

</script>

<style scoped>

</style>