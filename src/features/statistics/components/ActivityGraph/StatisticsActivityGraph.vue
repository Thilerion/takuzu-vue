<template>
<StatisticsHeatMap
	:ranks="activityRanks"
	:range="graphRange"
/>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { startOfDay, subDays, subYears } from 'date-fns';
import { useStatisticsNextStore } from '../../store.js';
import { createDailyActivitySummaries, rankDailyActivitySummaries } from '../../helpers/activity-summaries.js';
import { createHeatmapRange } from '../../helpers/heatmap-base-data.js';

const statsNextStore = useStatisticsNextStore();
const { itemsRecentFirst } = storeToRefs(statsNextStore);

const itemsPastYear = computed(() => {
	const now = new Date();
	const pastYear = startOfDay(subDays(subYears(now, 1), 1));
	return itemsRecentFirst.value.filter((item) => item.date >= pastYear);
})

const activitySummaries = computed(() => createDailyActivitySummaries(itemsPastYear.value));
const activityRanks = computed(() => {
	return rankDailyActivitySummaries(activitySummaries.value);
})

const graphRange = computed(() => createHeatmapRange());
</script>