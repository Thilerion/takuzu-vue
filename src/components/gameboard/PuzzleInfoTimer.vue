<template>
<div
	class="timer text-center"
	:class="{'animate-flicker': puzzlePaused}"
><span class="minutes">{{ minutes }}</span>:<span class="seconds">{{ seconds }}</span>
</div>
</template>

<script setup lang="ts">
import { usePuzzleTimer } from '@/stores/puzzle/timer-store.js';
import { timeFormatter } from '@/utils/date.utils';
import { computed, onBeforeUnmount, onMounted, ref, toRef } from 'vue';

defineProps<{
	puzzlePaused: boolean
}>();

const puzzleTimer = usePuzzleTimer();
const formatTime = timeFormatter({ padMinutes: false });

const totalTime = ref(0);
const interval = ref<null | number>(null);
const timeElapsed = toRef(puzzleTimer, 'timeElapsed');
const formattedTime = computed(() => formatTime(totalTime.value).split(':'));
const minutes = computed(() => formattedTime.value[0]);
const seconds = computed(() => formattedTime.value[1]);

const getTotalTime = () => {
	const elapsed = timeElapsed.value;
	let current = 0;
	if (puzzleTimer.running && puzzleTimer.startTime != null) {
		current = Date.now() - puzzleTimer.startTime;
	}
	totalTime.value = elapsed + current;
}

onMounted(() => {
	interval.value = window.setInterval(() => {
		getTotalTime();
	}, 1000 / 15);
})
onBeforeUnmount(() => {
	if (interval.value != null) {
		clearInterval(interval.value);
	}
	interval.value = null;
})
</script>

<style scoped>
.minutes {
	width: 2ch;
	@apply inline-block text-right;
}
.seconds {
	width: 2ch;
	@apply inline-block text-left;
}

@keyframes flickering {
	0% {
		opacity: 0.9;
	}
	15% {
		opacity: 0.9;
	}
	50% {
		opacity: 0.6;
	}
	85% {
		opacity: 0.9;
	}
	100% {
		opacity: 0.9;
	}
}
.animate-flicker {
	animation: flickering 2s infinite ease-in-out;
}
</style>