<template>
	<div class="space-y-4">
		<StatsOverview />
		<StatsActivity />
		<StatsFavorites />
	</div>
</template>

<script setup>
import { useStatisticsStore } from '@/stores/statistics.js';
import { provide, toRef } from 'vue';

const statsStore = useStatisticsStore();
const items = toRef(statsStore, 'historyItems');

provide('historyItems', items);

</script>

<style scoped>

</style>