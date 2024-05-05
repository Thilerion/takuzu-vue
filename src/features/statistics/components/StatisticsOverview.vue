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
			<!-- TODO: <template #footer>[x]m in last 30 days</template> -->
		</StatisticsOverviewTile>

		<StatisticsOverviewTile>
			<span>{{ $n(cellsFilled, 'compactShort', { maximumFractionDigits: 1, minimumFractionDigits: 0 }) }}</span>
			<template #title>{{ $t('Statistics.Overview.cells-filled') }}</template>
		</StatisticsOverviewTile>

		<StatisticsOverviewTile>
			<span><!-- TODO -->8x12 - Hard</span>
			<template #title>Favorite puzzle <small>(30d)</small></template>
			<template #footer>All-time: <span class="whitespace-nowrap">10x10 - Easy</span></template>
		</StatisticsOverviewTile>
	</div>
</div>

</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useStatisticsNextStore } from '../store.js';
import { computed } from 'vue';
import { isToday } from 'date-fns';
import { useFormattedDurationNarrow } from '../composables/format-duration.js';

const statsNextStore = useStatisticsNextStore();

const { itemsRecentFirst } = storeToRefs(statsNextStore);
const amountPlayedToday = computed((): number => {
	// Use itemsRecentFirst to find the index of the first item that was solved before today
	const index = itemsRecentFirst.value.findIndex(item => !isToday(item.date));
	return index === -1 ? itemsRecentFirst.value.length : index;
})

const timePlayedMs = computed(() => {
	return itemsRecentFirst.value.reduce((acc, item) => acc + item.timeElapsed, 0);
})
const formattedTimePlayed = useFormattedDurationNarrow(timePlayedMs);

// Approximate empty cells filled by converting a puzzle's widthXheight with an approximate masked ratio
const APPROX_MASK_RATIO = 0.7;
const cellsFilled = computed(() => {
	const totalCells = itemsRecentFirst.value.reduce((acc, item) => acc + item.numCells, 0);
	return Math.round(totalCells * APPROX_MASK_RATIO);
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