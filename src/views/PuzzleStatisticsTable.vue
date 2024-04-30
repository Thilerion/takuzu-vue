<template>
<div class="flex flex-col overflow-y-auto">
	<PageHeader
		class="bg-white shadow-sm"
		small
		:back-options="{ type: 'force', prevRouteName: 'Statistics' }"
	>{{ $t('Statistics.puzzle-statistics') }}</PageHeader>
	<div class="pt-4">
		<StatsMostPlayedList />
	</div>
</div>
</template>