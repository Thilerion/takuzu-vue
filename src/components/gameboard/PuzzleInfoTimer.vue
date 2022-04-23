<template>
	<div
		class="timer text-center"
		:class="{'animate-flicker': paused}"
	><span class="minutes">{{minutes}}</span>:<span class="seconds">{{seconds}}</span>
	</div>
</template>

<script>
import { usePuzzleStore } from '@/stores/puzzle';
import { usePuzzleTimer } from '@/stores/puzzle-timer.js';
import { timeFormatter } from '@/utils/date.utils.js';
import { toRef } from 'vue';

export default {
	setup() {
		const puzzleTimer = usePuzzleTimer();
		const puzzleStore = usePuzzleStore();
		const paused = toRef(puzzleStore, 'paused');
		return { puzzleTimer, paused };
	},
	data() {
		return {
			totalTime: 0,
			interval: null,
		}
	},
	computed: {
		timeElapsed() {
			return this.puzzleTimer.timeElapsed;
		},
		formattedTime() {
			return this.formatTime(this.totalTime).split(':');
		},
		minutes() {
			return this.formattedTime[0];
		},
		seconds() {
			return this.formattedTime[1];
		}
	},
	methods: {
		formatTime: timeFormatter({ padMinutes: false }),
		getTotalTime() {
			const elapsed = this.timeElapsed;
			let current = 0;
			if (this.puzzleTimer.running) {
				current = Date.now() - this.puzzleTimer.startTime;
			}
			this.totalTime = elapsed + current;
		},
	},
	mounted() {
		this.interval = setInterval(() => {
			this.getTotalTime();
		}, 1000 / 15);
	},
	beforeUnmount() {
		clearInterval(this.interval);
		this.interval = null;
	},
};
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