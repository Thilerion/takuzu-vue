<template>
	<div class="puzzle-row">
		<div
			class="puzzle-cell"
			:class="[cell.valueClass, { highlight: cell.highlighted, incorrect: cell.incorrect }]"
			v-for="(cell, cellIdx) in line"
			:key="cellIdx"
		>{{cell.displayValue}}</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	line: Record<string, any>
}>();
</script>

<style scoped>
.puzzle-row {
	@apply flex max-w-full;
	gap: 4px;
	line-height: 1;
	max-width: 500px;
}
.puzzle-row + .puzzle-row {
	@apply mt-1;
}

.puzzle-cell {
	@apply aspect-square flex-1 rounded flex items-center justify-center;
	@apply bg-gray-150 dark:bg-gray-300/20;
	max-width: 3rem;
	font-size: clamp(8px, calc(((95vw - 5.5rem) / var(--puzzle-row-example-size)) - 10px), 2.5rem);
}

:not(.dark) .puzzle-cell {
	--base-text-lightness: 43%;
	--text-blue-sat: 60%;
	--text-red-sat: 60%;
}
.dark .puzzle-cell {
	--base-text-lightness: 90%;
	--text-blue-sat: 80%;
	--text-red-sat: 60%;
}
.puzzle-cell.value-0 {
	/* @apply text-cell-blue-primary; */
	color: hsl(207 var(--text-blue-sat) var(--base-text-lightness));
}
.puzzle-cell.value-1 {
	/* @apply text-cell-red-primary; */
	color: hsl(7 var(--text-red-sat) var(--base-text-lightness));
}

.puzzle-cell.highlight {
	@apply ring-2 ring-inset dark:ring-gray-300/50 ring-gray-400;
}
.puzzle-cell.incorrect {
	@apply ring-2 dark:ring-red-300/50 ring-red-600/40 ring-inset;
	@apply bg-red-200/20 dark:bg-red-300/20;
}
</style>