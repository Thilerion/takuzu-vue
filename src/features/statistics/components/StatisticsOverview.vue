<template>
<div class="stats-overview mb-4 px-4">
	<h2 class="text-gray-600 dark:text-slate-200 text-lg font-medium px-0 pb-1">Overview</h2>
	<div class="grid gap-3 cards-grid max-w-screen-sm mx-auto">
		<StatisticsOverviewTile
			:value="statsNextStore.numSolved ?? 0"
		>
			<template #title>{{ $t('Statistics.Overview.puzzles-solved') }}</template>
			<template #footer>{{ $t('Statistics.Overview.n-solved-today', { n: 'x'}) }}</template>
		</StatisticsOverviewTile>

		<StatisticsOverviewTile
			value="1h 23m"
		>
			<template #title>{{ $t('Statistics.Overview.time-played') }}</template>
			<template #footer>[x]m in last 30 days</template>
		</StatisticsOverviewTile>

		<StatisticsOverviewTile
			:value="'xx,xk'"
		>
			<template #title>{{ $t('Statistics.Overview.cells-filled') }}</template>
		</StatisticsOverviewTile>

		<StatisticsOverviewTile
			value="8x12 - Hard"
		>
			<template #title>Favorite puzzle <small>(30d)</small></template>
			<template #footer>All-time: <span class="whitespace-nowrap">10x10 - Easy</span></template>
		</StatisticsOverviewTile>
	</div>
</div>

</template>

<script setup lang="ts">
import { useStatisticsNextStore } from '../store.js';

const statsNextStore = useStatisticsNextStore();
</script>

<style scoped>
.cards-grid {
	grid-template-rows: repeat(2, minmax(7rem, auto));
	grid-template-columns: repeat(2, 1fr);
}

@media (width < 360px) {
	.stats-overview {
		@apply px-2;
	}
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