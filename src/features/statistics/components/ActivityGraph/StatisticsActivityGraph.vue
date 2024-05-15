<template>
<div>
	<StatisticsHeatMap
		:range="graphRange"
		:items="items"
		:selected="selectedItemDateStr"
		@toggle="toggleItem($event)"
	/>
	<div class="h-6 w-full px-2 my-2">
		<div
			v-if="selectedItem != null"
			class="text-xs flex gap-x-3 max-w-sm text-center mx-auto"
		>
			<div class="flex-1 w-1/4">{{ $d(selectedItem.date, 'date-short') }}</div>
			<div class="flex-1 w-1/2">{{ selectedItem.data.puzzlesPlayed }} puzzles</div>
			<div class="flex-1 w-1/4">{{ formattedTimePlayed }}</div>
		</div>
	</div>
	
</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { startOfDay, subDays, subYears } from 'date-fns';
import { useStatisticsNextStore } from '../../store.js';
import { createHeatmapRange } from '../../helpers/heatmap-base-data.js';
import type { HeatMapItem } from './StatisticsHeatMap.vue';
import { useFormattedDurationNarrow } from '../../composables/format-duration.js';
import { createDailyActivitySummaries, rankDailyActivitySummaries } from '../../services/DailyActivityScores.service.js';

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
			date: summary.date,
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

const selectedItemDateStr = ref<string | undefined>();
const selectedItem = computed((): HeatMapItem | undefined => {
	if (selectedItemDateStr.value == null) return undefined;
	return items.value.get(selectedItemDateStr.value)!;
})
const selectedItemTimePlayed = computed(() => {
	if (selectedItem.value == null) return undefined;
	return selectedItem.value.data.totalTime;
})
const formattedTimePlayed = useFormattedDurationNarrow(selectedItemTimePlayed);
function toggleItem(dateStr: string) {
	if (selectedItemDateStr.value === dateStr) {
		selectedItemDateStr.value = undefined;
	} else if (!items.value.has(dateStr)) {
		selectedItemDateStr.value = undefined;
	} else {
		selectedItemDateStr.value = dateStr;
	}
}
</script>
