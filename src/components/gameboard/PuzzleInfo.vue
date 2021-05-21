<template>
	<div
		class="puzzle-info"
	>
		<div
			class="difficulty text-left"
		>{{difficulty}}* {{difficultyLabel}}</div>

		<div
			class="timer text-center"
			v-if="showTimer"
		><span class="minutes">{{minutes}}</span>:<span class="seconds">{{seconds}}</span></div>

		<div
			class="hints-used text-right"
		>Hints: 2</div>

	</div>
</template>

<script>
import { timeFormatter } from '@/utils/date.utils';
import { DIFFICULTY_LABELS } from '@/config';
export default {
	props: {
		showTimer: Boolean,
		difficulty: {
			type: Number,
			required: true,
		},
	},
	data() {
		return {
			timeElapsed: 100000,
		}
	},
	computed: {
		difficultyLabel() {
			return DIFFICULTY_LABELS[this.difficulty];
		},
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
.puzzle-info {
	@apply px-1 pb-1 text-xs flex flex-1 items-end text-gray-500 dark:text-gray-400 font-medium tracking-wider border-b border-gray-400 dark:border-gray-300 border-opacity-20 dark:border-opacity-10;
	min-width: 220px;
}

.puzzle-info > * {
	@apply w-1/3 flex-none;
}

.minutes {
	width: 2ch;
	@apply inline-block text-right;
}
.seconds {
	width: 2ch;
	@apply inline-block text-left;
}
</style>