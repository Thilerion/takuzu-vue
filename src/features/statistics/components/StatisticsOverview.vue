<template>
<div class="grid grid-cols-2 gap-3 px-4 cards-grid">
	<StatisticsOverviewTile
		value="123"
	>
		<template #title>{{ $t('Statistics.Overview.puzzles-solved') }}</template>
		<template #footer>{{ $t('Statistics.Overview.n-solved-today', 57) }}</template>
	</StatisticsOverviewTile>

	<StatisticsOverviewTile
		value="1h 23m"
	>
		<template #title>{{ $t('Statistics.Overview.time-played') }}</template>
		<template #footer>20m in last 30 days</template>
	</StatisticsOverviewTile>

	<StatisticsOverviewTile
		value="12,3k"
	>
		<template #title>{{ $t('Statistics.Overview.cells-filled') }}</template>
	</StatisticsOverviewTile>

	<StatisticsOverviewTile
		value="8x12 - Hard"
	>
		<template #title>Favorite puzzle</template>
		<template #footer>All-time favorite: 10x10&nbsp;-&nbsp;Easy</template>
	</StatisticsOverviewTile>
</div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.cards-grid {
	grid-template-rows: repeat(2, minmax(5.5rem, auto));
}
</style>