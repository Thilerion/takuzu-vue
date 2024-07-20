<template>
<div class="overflow-x-hidden fixed inset-0 overscroll-y-auto flex flex-col pb-8">
	<PageHeader
		:transparent="false"
		small
		elevated
		class="flex-shrink-0"
	>
		Puzzle Analysis
	</PageHeader>
	<div class="flex-1 pt-4">
		<main class="gap-y-4 grid bleed-grid-4 v-grid-bleed text-sm">
			<p>Puzzle analysis is not yet implemented. Sorry!</p>
		</main>
	</div>
</div>
</template>

<style scoped>
.v-grid-bleed {
	grid-template-columns: 1fr min(calc(100vw - 2 * var(--basePadding, 1rem)), 44rem) 1fr;
}
.v-grid-bleed>* {
	grid-column: 2 / span 1;
}
.v-grid-bleed>.full-bleed {
	grid-column: 1 / -1;
}
.bleed-grid-2 {
	--basePadding: theme(padding.2);
}
.bleed-grid-4 {
	--basePadding: theme(padding.4);
}
.bleed-grid-6 {
	--basePadding: theme(padding.6);
}
</style>