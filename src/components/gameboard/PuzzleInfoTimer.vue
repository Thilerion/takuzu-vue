<template>
	<div
		class="timer text-center"
	><span class="minutes">{{minutes}}</span>:<span class="seconds">{{seconds}}</span>
	</div>
</template>

<script>
import { timeFormatter } from '@/utils/date.utils';

export default {
	props: {
		timeElapsed: {
			type: Number,
			required: true
		}
	},
	computed: {
		formattedTime() {
			return this.formatTime(this.timeElapsed).split(':');
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
	}
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