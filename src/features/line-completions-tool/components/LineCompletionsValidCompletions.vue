<template>
<div>
	<slot
		v-if="isInvalidLine"
		name="invalid"
	/>
	<div
		v-else-if="!isEmptyInput && completions != null && cappedCompletions != null && cappedCompletions.length > 0"
		class="flex flex-col gap-y-1"
	>
		<LineCompletionsLineMarkup
			v-for="(completion, cIdx) in detailedCompletions"
			:key="`${cIdx}-${completion}`"
			:line="completion"
		/>
		<div v-if="remaining > 0" class="mt-2">... and {{ remaining }} more</div>
	</div>
	
	<slot
		v-else
		name="fallback"
	/>
</div>
</template>

<script setup lang="ts">
import type { LineArrSymbolPermutations } from '@/lib/line-generation/types.js';
import type { PuzzleValueLine, PuzzleValueLineStr } from '@/lib/types.js';
import { computed } from 'vue';
import type { PuzzleLineMarkupDetails } from './LineCompletionsLineMarkup.vue';
import { EMPTY } from '@/lib/constants.js';

const props = defineProps<{
	input: null | PuzzleValueLineStr,
	completions: LineArrSymbolPermutations | null,
	result: null | PuzzleValueLine
}>();

const isInvalidLine = computed(() => {
	return props.input != null && props.result == null;
})
const isEmptyInput = computed(() => {
	return props.input == null;
})

const SHOW_MAX = 20;
const amount = computed(() => {
	if (props.completions == null) return 0;
	return props.completions.length;
})
const remaining = computed(() => {
	if (amount.value > SHOW_MAX) return amount.value - SHOW_MAX;
	return 0;
})

const cappedCompletions = computed(() => {
	return props.completions?.slice(0, SHOW_MAX);
})

const solvedIndexes = computed(() => {
	if (props.completions == null || props.result == null) return [];
	const resLine = props.result!;
	const inpLine = props.input!;
	const result: number[] = [];

	for (let i = 0; i < resLine.length; i++) {
		const resCh = resLine[i];
		const inCh = inpLine[i];
		if (inCh === EMPTY && resCh !== EMPTY) result.push(i);
	}
	return result;
})
const unsolvedIndexes = computed(() => {
	if (props.completions == null || props.result == null) return [];
	const resLine = props.result!;
	const inpLine = props.input!;
	const result: number[] = [];

	for (let i = 0; i < resLine.length; i++) {
		const inpCh = inpLine[i];
		const resCh = resLine[i];
		if (inpCh === EMPTY && resCh === EMPTY) result.push(i);
	}
	return result;
})

const detailedCompletions = computed(() => {
	if (cappedCompletions.value == null) return null;
	return cappedCompletions.value.map((c) => c.map((ch, idx): PuzzleLineMarkupDetails => {
		const res: PuzzleLineMarkupDetails = {
			value: ch,
			index: idx,
			emphasis: 'base'
		}
		if (solvedIndexes.value.includes(idx)) {
			res.emphasis = 'high';
		} else if (!unsolvedIndexes.value.includes(idx)) {
			// Cells that have a value in input can be slightly de-emphasized.
			res.emphasis = 'low';
		}
		return res;
	}))
})
</script>