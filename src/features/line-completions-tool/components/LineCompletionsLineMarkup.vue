<template>
<div class="inline-flex gap-x-[1ch]">
	<div
		v-for="(value, index) in line"
		:key="`${index}-${value.value}`"
		:data-emphasis="value.emphasis"
		class="font-mono w-[1ch] line-completion-value"
		:class="valueClasses"
	>{{ value.value }}</div>
</div>
</template>

<script setup lang="ts">
import type { PuzzleValue } from '@/lib/constants.js';

export type PuzzleLineMarkupDetails = {
	value: PuzzleValue,
	index: number,
	/** Two "low" levels, then base, then "high" */
	emphasis: "veryLow" | "low" | "base" | "high",
};

defineProps<{
	line: PuzzleLineMarkupDetails[],
	valueClasses?: string
}>();
</script>

<style scoped>
.line-completion-value:where([data-emphasis="high"]) {
	@apply font-bold;
}
.line-completion-value:where([data-emphasis="low"]) {
	@apply opacity-80;
}
.line-completion-value:where([data-emphasis="veryLow"]) {
	@apply opacity-50;
}
</style>