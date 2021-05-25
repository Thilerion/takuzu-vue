<template>
	<div class="bg-white text-gray-900 w-full m-auto rounded overflow-hidden">
		<div class="time">Your time: {{time}}</div>
		<div class="inner px-6 pt-2 pb-6">
			<div class="text-center flex">
				<div class="overview">
					<div class="average">Average: {{average}}</div>
					<div class="best">Best: {{best}}</div>
					<div class="solved">You've solved {{count}} puzzles @ {{dimensions}} - {{difficulty}}*</div>
					<BaseButton class="stats-btn" @click="$emit('exit-to', 'statistics')">View all statistics</BaseButton>
				</div>
			</div>
			
			<div class="grid gap-2 grid-cols-2 auto-rows-auto max-w-full">
				<BaseButton @click="$emit('exit-to', 'new-game')">Create new game</BaseButton>
				<BaseButton @click="$emit('exit-to', 'play-again')">Play again</BaseButton>
				<BaseButton @click="$emit('exit-to', 'home')">Home</BaseButton>				
			</div>
		</div>
	</div>
</template>

<script>
import { timeFormatter } from '@/utils/date.utils';

export default {
	props: {
		stats: {
			type: Object,
			required: true,
		},
		lastPuzzle: {
			type: Object,
			required: true,
		}
	},
	emits: ['exit-to'],
	methods: {
		msToMinSec: timeFormatter({ padMinutes: true }),
	},
	computed: {
		time() {
			return this.msToMinSec(this.lastPuzzle.timeElapsed);
		},
		average() {
			return this.msToMinSec(this.stats.average);
		},
		previousAverage() {
			const ms = this.stats.previousAverage;
			if (ms != null) return this.msToMinSec(ms);
			return null;
		},
		best() {
			return this.msToMinSec(this.stats.best);
		},
		previousBest() {
			if (this.lastPuzzle.timeElapsed === this.stats.best) {
				return this.msToMinSec(this.stats.secondBest);
			} else {
				return this.best;
			}
		},
		count() {
			return this.stats.count;
		},
		dimensions() {
			return `${this.lastPuzzle.width}x${this.lastPuzzle.height}`;
		},
		difficulty() {
			return this.lastPuzzle.difficulty;
		}
	}
};
</script>

<style lang="postcss" scoped>
.time {
	@apply bg-teal-600 text-white text-2xl text-center mb-4 py-6 px-4;
}

.overview {
	@apply inline-grid text-center mx-auto mb-6;
	grid-template-rows: repeat(3, auto);
	grid-template-columns: repeat(2, 50%);
	grid-template-areas:
		"solved solved"
		"average best"
		"stats stats";
	gap: 1rem 0;
}
.overview .average {
	grid-area: average;
	@apply text-left;
}
.overview .best {
	grid-area: best;
	@apply text-right;
}
.overview .solved {
	grid-area: solved;
	@apply text-center;
}
.overview .stats-btn {
	grid-area: stats;
}
</style>