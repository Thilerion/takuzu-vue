<template>
<StatisticsHeatMap
	:range="graphRange"
	:items="items"
	:selected="selectedItem"
	@toggle="toggleItem($event)"
/>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { startOfDay, subDays, subYears } from 'date-fns';
import { useStatisticsNextStore } from '../../store.js';
import { createDailyActivitySummaries, rankDailyActivitySummaries } from '../../helpers/activity-summaries.js';
import { createHeatmapRange } from '../../helpers/heatmap-base-data.js';
import type { HeatMapItem } from './StatisticsHeatMap.vue';

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

const items = computed(() => {
	const result: Map<string, HeatMapItem> = new Map();

	for (const [dateStr, summary] of activitySummaries.value) {
		const rank = activityRanks.value.get(dateStr)!;
		result.set(dateStr, {
			dateStr,
			level: rank + 1,
			data: {
				puzzlesPlayed: summary.puzzlesPlayed,
				totalTime: summary.totalTime,
			}
		})
	}
	return result;
})

const selectedItem = ref<string | undefined>();
function toggleItem(item: HeatMapItem) {
	if (selectedItem.value === item.dateStr) {
		selectedItem.value = undefined;
	} else {
		selectedItem.value = item.dateStr;
	}
}
</script>