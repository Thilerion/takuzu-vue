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

<script setup lang="ts">
import { DIFFICULTY_LABELS } from '@/config';
import { computed } from 'vue';

export interface Props {
	showTimer?: boolean,
	difficulty: keyof typeof DIFFICULTY_LABELS,
	progress?: number,
	hasBorder?: boolean
};

const props = withDefaults(defineProps<Props>(), {
	progress: -1
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