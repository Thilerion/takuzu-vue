<template>
	<div
		@click="pauseTimer"
		class="timer text-center"
	><span class="minutes">{{minutes}}</span>:<span class="seconds">{{seconds}}</span>
	</div>
</template>

<script>
import { timeFormatter } from '@/utils/date.utils';

export default {
	data() {
		return {
			totalTime: 0,
			interval: null,
		}
	},
	computed: {
		timeElapsed() {
			return this.$store.state.puzzle.timer.timeElapsed;
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
			if (this.$store.state.puzzle.timer.running) {
				current = Date.now() - this.$store.state.puzzle.timer.startTime;
			}
			this.totalTime = elapsed + current;
		},
		pauseTimer() {
			if (this.$store.state.puzzle.timer.running) {
				this.$store.commit('puzzle/timer/pause');
			} else {
				this.$store.commit('puzzle/timer/resume');
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

<style lang="postcss" scoped>
.minutes {
	width: 2ch;
	@apply inline-block text-right;
}
.seconds {
	width: 2ch;
	@apply inline-block text-left;
}
</style>