<template>
<div class="stats-overview">
	<StatisticsBlockHeading>Overview</StatisticsBlockHeading>
	<div class="grid gap-3 cards-grid max-w-screen-sm mx-auto">
		<StatisticsOverviewTile
			:value="statsNextStore.numSolved ?? 0"
		>
			<template #title>{{ $t('Statistics.Overview.puzzles-solved') }}</template>
			<template #footer>{{ $t('Statistics.Overview.n-solved-today', { n: amountPlayedToday}) }}</template>
		</StatisticsOverviewTile>

		<StatisticsOverviewTile>
			<span>{{ formattedTimePlayed }}</span>
			<template #title>{{ $t('Statistics.Overview.time-played') }}</template>
			<template #footer>{{ $t('Statistics.Overview.time-played-30-days', { time: formattedTimePlayed30Days }) }}</template>
		</StatisticsOverviewTile>

		<StatisticsOverviewTile>
			<span>{{ $n(cellsFilled, 'compactShort', { maximumFractionDigits: 1, minimumFractionDigits: 0 }) }}</span>
			<template #title>{{ $t('Statistics.Overview.cells-filled') }}</template>
		</StatisticsOverviewTile>

		<StatisticsOverviewTile>
			<span>{{ mostPlayed30 ?? '---' }}</span>
			<template #title>Most played <small>(30d)</small></template>
			<template #footer>All-time: <span class="whitespace-nowrap">{{ mostPlayedAll ?? '---' }}</span></template>
		</StatisticsOverviewTile>
	</div>
</div>

</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useStatisticsNextStore } from '../store.js';
import { computed } from 'vue';
import { isToday, subDays } from 'date-fns';
import { useFormattedDurationNarrow } from '../composables/format-duration.js';
import { getMostPlayedPuzzleConfig, summarizeByPuzzleConfig, type PuzzleConfigSummaries } from '../services/HistorySummaries.service.js';

const statsNextStore = useStatisticsNextStore();

const { itemsRecentFirst } = storeToRefs(statsNextStore);
const itemsRecent30Days = computed(() => {
	const thirtyDaysAgo = subDays(new Date(), 30);
	return itemsRecentFirst.value.filter(item => item.date >= thirtyDaysAgo);
})

const amountPlayedToday = computed((): number => {
	// Use itemsRecentFirst to find the index of the first item that was solved before today
	const index = itemsRecentFirst.value.findIndex(item => !isToday(item.date));
	return index === -1 ? itemsRecentFirst.value.length : index;
})

const timePlayedMs = computed(() => {
	return itemsRecentFirst.value.reduce((acc, item) => acc + item.timeElapsed, 0);
})
const timePlayedMs30Days = computed(() => {
	return itemsRecent30Days.value.reduce((acc, item) => acc + item.timeElapsed, 0);
})
const formattedTimePlayed = useFormattedDurationNarrow(timePlayedMs);
const formattedTimePlayed30Days = useFormattedDurationNarrow(timePlayedMs30Days);

// Approximate empty cells filled by converting a puzzle's widthXheight with an approximate masked ratio
const APPROX_MASK_RATIO = 0.7;
const cellsFilled = computed(() => {
	const totalCells = itemsRecentFirst.value.reduce((acc, item) => acc + item.numCells, 0);
	return Math.round(totalCells * APPROX_MASK_RATIO);
})


// TODO: Move to composable; combine "mostPlayed" by count and "longestPlaytime"
const summariesAll = computed(() => {
	return summarizeByPuzzleConfig(itemsRecentFirst.value);
})
const mostPlayedAll = computed(() => {
	return getMostPlayedPuzzleConfig(summariesAll.value);
})

const summaries30 = computed((): PuzzleConfigSummaries => {
	if (itemsRecent30Days.value.length === 0) return new Map();
	return summarizeByPuzzleConfig(itemsRecent30Days.value);
})
const mostPlayed30 = computed(() => {
	if (summaries30.value.size === 0) return null;
	return getMostPlayedPuzzleConfig(summaries30.value);
})
</script>

<style scoped>
.cards-grid {
	grid-template-rows: repeat(2, minmax(7rem, auto));
	grid-template-columns: repeat(2, 1fr);
}

@media (width < 360px) {
	.cards-grid {
		@apply gap-2;
	}
}

/* Use single column on extra-extra small screens */
@media (width < 350px) {
	.cards-grid {
		grid-template-columns: 1fr;
		grid-template-rows: initial;
		grid-auto-rows: 1fr;
	}
}
</style>