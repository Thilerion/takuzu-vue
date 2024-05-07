<template>
<div class="flex flex-col">
	<PageHeader
		hide-back
		small
		elevated
		:transparent="false"
		class="mb-4"
	>{{ $t('Statistics.title') }}</PageHeader>

	<StatisticsStoreLoader>
		<StatisticsNextContent />
	</StatisticsStoreLoader>

	<StatisticsDataActions />

</div>
</template>