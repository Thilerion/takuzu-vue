<template>
	<div
		@click="pauseTimer"
		class="timer text-center"
	><span class="minutes">{{minutes}}</span>:<span class="seconds">{{seconds}}</span>
	</div>
</template>

<script>
import { usePuzzleTimer } from '@/stores/puzzle-timer.js';
import { timeFormatter } from '@/utils/date.utils.js';

export default {
	setup() {
		const puzzleTimer = usePuzzleTimer();
		return { puzzleTimer };
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
		pauseTimer() {
			if (this.puzzleTimer.running) {
				this.puzzleTimer.pause();
			} else {
				this.puzzleTimer.resume();
			}
		}
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
</style>