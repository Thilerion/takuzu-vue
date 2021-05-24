<template>
	<div
		class="puzzle-info"
	>
		<div
			class="difficulty text-left"
		>{{difficulty}}* {{difficultyLabel}}</div>

		<PuzzleInfoTimer
			v-if="showTimer"
		/>

		<div
			class="progress text-right"
		>Progress:<div class="progress-percentage">{{progress}}</div>%</div>

	</div>
</template>

<script>
import { DIFFICULTY_LABELS } from '@/config';
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
		}
	},
	computed: {
		difficultyLabel() {
			return DIFFICULTY_LABELS[this.difficulty];
		},
	}
};
</script>

<style lang="postcss" scoped>
.puzzle-info {
	@apply px-1 pb-1 text-xs flex flex-1 items-end text-gray-500 dark:text-gray-400 font-medium tracking-wider border-b border-gray-400 dark:border-gray-300 border-opacity-20 dark:border-opacity-10;
	min-width: 220px;
}

.puzzle-info > * {
	@apply w-1/3 flex-none;
}

.progress-percentage {
	@apply inline-block text-right;
	width: 3.5ch;
}
</style>