<template>
	<div
		class="progress-wrapper"
		:class="{ 
			error: finishedWithMistakes,
			finished
		}"
	>
		<div
			class="progress-value"
		></div>
	</div>
</template>

<script setup lang="ts">
import { usePuzzleStore } from '@/stores/puzzle';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const puzzleStore = usePuzzleStore();
const {
	finishedWithMistakes,
	boardFilled: finished,
	progress
} = storeToRefs(puzzleStore);

const cappedProgress = computed(() => Math.max(progress.value, 0.005));
</script>

<style scoped>
.progress-wrapper {
	@apply w-full bg-gray-400 bg-opacity-20 pointer-events-none;
	height: 3px;

	--progress: v-bind(cappedProgress);
}
.progress-value {
	@apply h-full w-full bg-teal-500 dark:bg-teal-600;
	@apply transform origin-left;
	transform: scaleX(var(--progress, 0.1));
	transition: transform .25s ease, opacity .15s ease;
}

.finished .progress-value {
	@apply opacity-100;
}

/* delay added to prevent red flash when last cell is toggled twice to the correct value */
.finished.error .progress-value {
	transition: background-color .05s ease .2s;
	@apply bg-red-500;
}
</style>