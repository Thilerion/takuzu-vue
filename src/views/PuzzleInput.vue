<template>
<div class="flex flex-col overflow-x-hidden fixed inset-0 overscroll-y-auto">
	<PageHeader
		:transparent="false"
		small
		elevated
		class="flex-shrink-0"
		:back-options="{ type: 'simple', fallbackRouteName: 'PuzzleTools' }"
	>{{ $t('PuzzleEditor.page-title') }}</PageHeader>
	<div class="flex-1 flex flex-col">
		<CustomPuzzleInput />
	</div>
</div>
</template>