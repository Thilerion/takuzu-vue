<template>
<div>
	<div class="flex flex-row justify-around px-1 transition-opacity duration-300 delay-150 gap-x-2 max-w-md mx-auto" :class="{'opacity-30': !validInput }">
		<div
			class="flex flex-row px-4 rounded h-6 items-center leading-none text-xs transition-colors delay-150 duration-300 gap-x-4 w-fit whitespace-nowrap"
			:class="{
				'bg-red-200 text-red-900 delay-300': !solvable && validInput,
				'bg-green-100 text-green-900': validPuzzle,
			}"
		>
			<div>Solutions</div>
			<div>{{ displayedNumSolutions }}</div>
		</div>
		<div
			class="flex flex-row px-4 rounded h-6 items-center leading-none text-xs gap-x-4 w-fit whitespace-nowrap"
		>
			<div>Mask ratio</div>
			<div>{{ asPercentage(maskRatio ?? 1) }}</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import type { BoardShape, PuzzleGrid } from '@/lib/types.js';
import { toRefs, computed } from 'vue';
import { useSolutionsAnalysis } from '@/features/custom-puzzle-create/composables/solutions-analysis.js';
import { asPercentage } from '@/utils/number.utils.js';

const props = defineProps<{
	grid: PuzzleGrid | null;
	dimensions: BoardShape;
}>();

const { grid, dimensions } = toRefs(props);

const MAX_SOLUTIONS = 200;
const { 
	solutions,
	validInput,
	maskRatio,
	validPuzzle,
	solvable,
	/* isRunning */
} = useSolutionsAnalysis(grid, dimensions, MAX_SOLUTIONS);
const displayedNumSolutions =  computed(() => {
	if (solutions.value == null || !validInput.value) {
		// Not running solver (yet), so can potentially have many solutions
		return `${MAX_SOLUTIONS}+`;
	} else if (solutions.value >= MAX_SOLUTIONS) {
		// High probability that the solver stopped early (at MAX_SOLUTIONS)
		return `${solutions.value}+`;
	} else return `${solutions.value}`;
})
</script>