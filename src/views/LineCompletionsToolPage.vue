<template>
<div class="flex flex-col pb-12 overflow-x-hidden fixed inset-0 overscroll-y-auto">
	<PageHeader
		:transparent="false"
		small
		elevated
		class="flex-shrink-0"
		:back-options="{ type: 'simple', fallbackRouteName: 'PuzzleTools' }"
	>Line Completions</PageHeader>
	<div class="flex-1 flex flex-col">
		<LineCompletionsTool />
	</div>
</div>
</template>