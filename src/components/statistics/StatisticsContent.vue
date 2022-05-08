<template>
	<div class="space-y-4">
		<router-link to="/stats/table" v-if="debugMode">Stats table</router-link>
		<StatsOverview />
		<StatsActivity />
	</div>
</template>

<script setup>
import StatsOverview from './StatsOverview.vue';
import { useStatisticsStore } from '@/stores/statistics.js';
import { provide, toRef } from 'vue';
import StatsActivity from './StatsActivity.vue';
import StatsMostPlayedList from './StatsMostPlayedList.vue';
import { useMainStore } from '@/stores/main';

const mainStore = useMainStore();
const debugMode = toRef(mainStore.debugModeData, 'enabled');

const statsStore = useStatisticsStore();
const items = toRef(statsStore, 'historyItems');

provide('historyItems', items);

</script>

<style scoped>

</style>