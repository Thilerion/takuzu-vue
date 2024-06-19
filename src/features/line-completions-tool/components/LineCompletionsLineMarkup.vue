<template>
<div class="inline-flex gap-x-[1ch]">
	<div
		v-for="(value, index) in line"
		:key="`${index}-${value.value}`"
		:class="{
			'font-bold': value.emphasis === 'high',
			'opacity-50': value.emphasis === 'veryLow',
			'opacity-80': value.emphasis === 'low',
		}"
		class="font-mono w-[1ch]"
	>{{ value.value }}</div>
</div>
</template>

<script setup lang="ts">
import type { PuzzleValue } from '@/lib/constants.js';

export type PuzzleLineMarkupDetails = {
	value: PuzzleValue,
	index: number,
	/** Two "low" levels, then base, then "high" */
	emphasis: "veryLow" | "low" | "base" | "high"
};

defineProps<{
	line: PuzzleLineMarkupDetails[]
}>();
</script>