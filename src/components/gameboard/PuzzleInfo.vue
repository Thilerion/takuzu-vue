<template>
	<div
		class="puzzle-info"
		:class="{ 'has-border': hasBorder }"
	>
		<div
			class="difficulty text-left"
		>{{difficulty}}* {{difficultyLabel}}</div>

		<PuzzleInfoTimer
			:puzzle-paused="puzzlePaused"
			v-if="showTimer"
		/>

		<div
			class="progress text-right whitespace-nowrap"
		>Progress:<div class="progress-percentage">{{progressPercentage}}</div>%</div>

	</div>
</template>

<script setup lang="ts">
import { DIFFICULTY_LABELS } from '@/config';
import { computed } from 'vue';

const props = defineProps<{
	showTimer: boolean,
	difficulty: keyof typeof DIFFICULTY_LABELS,
	progressRatio: number,
	hasBorder: boolean,
	puzzlePaused: boolean
}>();

// Display the progress as, rounded and as percentage, while preventing it from being 100% if the puzzle is not yet solved.
const progressPercentage = computed(() => {
	const base = props.progressRatio;
	const rounded = Math.ceil(base * 100);
	// prevent progress from being 100 when not every cell is filled
	if (rounded == 100 && base < 1) return 99;
	return rounded;
})

const difficultyLabel = computed(() => DIFFICULTY_LABELS[props.difficulty]);

</script>

<style scoped>
.puzzle-info {
	@apply px-1 pb-1 text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider;

	@apply grid w-full;
	grid-template-rows: 1fr;
	grid-template-columns: calc(50% - 3ch) 6ch calc(50% - 3ch);
}

.puzzle-info.has-border {
	@apply border-b border-gray-400 dark:border-gray-300 border-opacity-20 dark:border-opacity-10;
}

.progress-percentage {
	@apply inline-block text-right;
	width: 3.5ch;
}
.progress {
	grid-column: 3 / span 1;
}
</style>