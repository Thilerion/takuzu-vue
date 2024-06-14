<template>
<div>
	<div class="flex flex-row justify-around px-1 transition-opacity duration-300 delay-150 gap-x-2 max-w-md mx-auto" :class="{'opacity-30': !validInput }">
		<div
			class="flex flex-row px-4 rounded h-6 items-center leading-none text-xs transition-colors delay-150 duration-300 gap-x-4 w-fit whitespace-nowrap"
			:class="{
				'bg-red-200 text-red-900 delay-300': !solvable && validInput && solutions != null,
				'bg-green-100 text-green-900': validPuzzle,
			}"
		>
			<div>{{ $t('PuzzleEditor.validation.solutions') }}</div>
			<div>{{ displayedNumSolutions }}</div>
		</div>
		<div
			class="flex flex-row px-4 rounded h-6 items-center leading-none text-xs gap-x-4 w-fit whitespace-nowrap"
		>
			<div>{{ $t('PuzzleEditor.validation.mask-ratio') }}</div>
			<div>{{ asPercentage(maskRatio ?? 1) }}</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { toRefs, computed } from 'vue';
import { asPercentage } from '@/utils/number.utils.js';

const props = defineProps<{
	maxSolutions: number;
	solutions: number | null;
	validInput: boolean;
	maskRatio: number;
	validPuzzle: boolean;
	solvable: boolean;
}>();
const { solutions, validInput, maxSolutions, maskRatio} = toRefs(props);

const displayedNumSolutions =  computed(() => {
	if (solutions.value == null || !validInput.value) {
		// Not running solver (yet), so can potentially have many solutions
		return `${maxSolutions.value}+`;
	} else if (solutions.value >= maxSolutions.value) {
		// High probability that the solver stopped early (at maxSolutions)
		return `${solutions.value}+`;
	} else return `${solutions.value}`;
})
</script>