<template>
<div class="flex flex-col overflow-y-auto">
	<PageHeader
		:back-options="{ type: 'force', prevRouteName: 'StatisticsNext' }"
	>{{ $t('Statistics.History.puzzle-history') }}</PageHeader>

	<StatisticsStoreLoader>
		<StatisticsHistory />
	</StatisticsStoreLoader>
</div>
</template>