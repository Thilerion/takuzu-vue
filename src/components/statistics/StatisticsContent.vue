<template>
	<div class="space-y-4">
		<StatsOverview />
		<StatsActivity />
	</div>
</template>

<script setup>
import StatsOverview from './StatsOverview.vue';
import { useStatisticsStore } from '@/stores/statistics.js';
import { computed, provide, toRef, watchEffect } from 'vue';
import StatsActivity from './StatsActivity.vue';
import { getMostPlayedPuzzleConfigs } from '@/services/stats/most-played';

const statsStore = useStatisticsStore();
const items = toRef(statsStore, 'historyItems');
const sortedByDate = toRef(statsStore, 'sortedByDate');

provide('historyItems', items);

const mostRecentItems = computed(() => {
	return sortedByDate.value.slice(0, 400);
})

const mostPlayedPuzzleConfigs = computed(() => {
	if (!items.value.length) return null;
	return getMostPlayedPuzzleConfigs(items.value);
})
const mostPlayedRecentPuzzleConfigs = computed(() => {
	if (!mostRecentItems.value.length) return null;
	return getMostPlayedPuzzleConfigs(mostRecentItems.value);
})
watchEffect(() => {
	const data = mostPlayedPuzzleConfigs.value;
	const dataRecent = mostPlayedRecentPuzzleConfigs.value;
	if (!data) return;
	const { groupedData, byPlaytime, byPlayed, byFavorite } = data;
	const mostPlayedByPlaytime = byPlaytime[0].key;
	const mostPlayedByPlayed = byPlayed[0].key;
	const mostPlayedByFavorite = byFavorite[0].key;

	console.log({
		allTimeFavorite: data.byFavorite,
		recentFavorite: dataRecent.byFavorite
	})

	const byPlaytimeList = data.byPlaytime.map(val => val.key).slice(0, 8);
	const byPlayedList = data.byPlayed.map(val => val.key).slice(0, 8);
	const byFavoriteList = data.byFavorite.map(val => val.key).slice(0, 8);

	const byPlaytimeList2 = dataRecent.byPlaytime.map(val => val.key).slice(0, 8);
	const byPlayedList2 = dataRecent.byPlayed.map(val => val.key).slice(0, 8);
	const byFavoriteList2 = dataRecent.byFavorite.map(val => val.key).slice(0, 8);

	console.log({
		byFavoriteList, byFavoriteList2,
		byPlayedList, byPlayedList2,
		byPlaytimeList, byPlaytimeList2
	})
})
</script>

<style scoped>

</style>