<template>
	<div
		class="puzzle-info"
		:class="{ 'has-border': hasBorder }"
	>
		<div
			class="difficulty text-left"
		>{{difficulty}}* {{difficultyLabel}}</div>

		<PuzzleInfoTimer
			v-if="showTimer"
		/>

		<div
			class="progress text-right whitespace-nowrap"
		>Progress:<div class="progress-percentage">{{progress}}</div>%</div>

	</div>
</template>

<script>
import { DIFFICULTY_LABELS } from '@/config.js';
import PuzzleInfoTimer from './PuzzleInfoTimer.vue';

export default {
	components: { PuzzleInfoTimer },
	props: {
		showTimer: Boolean,
		difficulty: {
			type: Number,
			required: true,
		},
		progress: {
			type: Number,
			default: -1
		},
		hasBorder: Boolean
	},
	computed: {
		difficultyLabel() {
			return DIFFICULTY_LABELS[this.difficulty];
		},
	}
};
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