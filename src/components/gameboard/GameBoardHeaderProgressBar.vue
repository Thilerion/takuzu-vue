<template>
<div
	class="w-full bg-gray-400 bg-opacity-20 pointer-events-none h-[3px]"
	:style="{ '--progress': cappedProgress }"
	:class="{ 
		error: props.error,
		finished: finished,
	}"
>
	<div class="progress-value h-full w-full bg-teal-500 dark:bg-teal-600 transform origin-left"></div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	progressRatio: number,
	error: boolean, // if finished but has mistakes
}>();

const finished = computed(() => props.progressRatio >= 0.999);
const cappedProgress = computed(() => Math.max(props.progressRatio, 0.005));
</script>

<style scoped>
.progress-value {
	transform: scaleX(var(--progress, 0.1));
	transition: 
		transform .25s ease,
		opacity .15s ease;
}

.finished > .progress-value {
	@apply opacity-100;
}

/* delay added to prevent red flash when last cell is toggled twice to the correct value */
.finished.error > .progress-value {
	transition: background-color .05s ease .2s;
	@apply bg-red-500;
}
</style>