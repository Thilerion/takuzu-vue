<template>
<span class="inline-flex gap-x-0 -ml-[0.333ch] cursor-text">
	<span
		v-for="(value, index) in line"
		:key="`${index}-${value.value}`"
		:data-emphasis="value.emphasis"
		class="font-number w-[2.25ch] text-center line-completion-value"
		:class="valueClasses"
	>{{ value.value }}</span>
</span>
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
	@apply font-bold bg-sky-100;
}
.line-completion-value:where([data-emphasis="low"]) {
	@apply opacity-80;
}
.line-completion-value:where([data-emphasis="veryLow"]) {
	@apply opacity-50;
}
</style>