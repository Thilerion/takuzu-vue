<template>
	<div class="bg-white text-gray-900 w-full m-auto rounded overflow-hidden">
		<header class="modal-header">
			<div>
				<div class="time-container">
					<span class="time">{{time}}</span>
				</div>
			</div>
			<div class="record-type" v-if="recordTypeMsg">{{recordTypeMsg}}</div>
		</header>
		<div class="inner px-6 pt-4 pb-6 text-sm">
			<div class="text-center flex">
				<div class="overview">
					
					<div
						class="solved"
					>You've solved {{count}} puzzles @ {{dimensions}} - {{difficulty}}*</div>

					<div class="overview-item average">
						<div class="overview-label">Average time</div>
						<div class="overview-value">{{average}}</div>
					</div>
					<div class="overview-item best">
						<div class="overview-label">Best time</div>
						<div class="overview-value">{{best}}</div>
					</div>

					<div
						class="stats-recap"
					>
						<div v-if="highScoreMessage" class="highscore-msg">{{recapMessage}}</div>
						<button
							class="stats-btn"
							@click="$emit('exit-to', 'statistics')"
						><span class="material-icons">leaderboard</span> View all statistics</button>
					</div>

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

const recapMsgTypes = {
	FIRST: 'first puzzle solved',
	TIME_RECORD: 'time record',
	AVERAGE_IMPROVED: 'better than average',
	DEFAULT: 'none'
};

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
		msToSec(ms) {
			if (ms <= 100) {
				return Math.round(ms) / 1000;
			} else if (ms < 1020) {
				return (Math.round(ms / 10) / 100).toFixed(2);
			} else if (ms < 9500) {
				return (Math.round(ms / 100) / 10).toFixed(1);
			} else {
				return Math.round(ms / 1000);
			}
		}
	},
	computed: {
		// records/ messages/ high score checks
		isTimeRecord() {
			return this.lastPuzzle.timeElapsed <= this.stats.best;
		},
		isFirstPuzzleSolved() {
			return this.stats.count === 1;
		},
		differenceFromBest() {
			if (!this.isTimeRecord || this.isFirstPuzzleSolved) return null;
			const prevBest = this.stats.secondBest;
			const time = this.lastPuzzle.timeElapsed;
			return prevBest - time;
		},
		differenceFromAverage() {
			const avg = this.stats.previousAverage;
			const time = this.lastPuzzle.timeElapsed;
			return time - avg;
		},
		amountFasterThanAverage() {
			const diff = this.differenceFromAverage;
			if (diff > 0) return null;
			return Math.abs(diff);
		},
		isBetterThanAverage() {
			return this.differenceFromAverage < 0;
		},
		highScoreMessage() {
			if (this.isFirstPuzzleSolved) return recapMsgTypes.FIRST;
			if (this.isTimeRecord) return recapMsgTypes.TIME_RECORD;
			if (this.isBetterThanAverage) return recapMsgTypes.AVERAGE_IMPROVED;
			return recapMsgTypes.DEFAULT;
		},
		recordTypeMsg() {
			if (this.highScoreMessage === recapMsgTypes.TIME_RECORD) {
				return 'New time record!'
			} else if (this.highScoreMessage === recapMsgTypes.AVERAGE_IMPROVED) {
				return 'Average improved!';
			} else return;
		},
		recapMessage() {
			if (this.highScoreMessage === recapMsgTypes.FIRST) {
				return `You've solved this puzzle for the first time, great job!`;
			} else if (this.highScoreMessage === recapMsgTypes.TIME_RECORD) {
				const improvement = this.msToSec(Math.abs(this.differenceFromBest));
				return `You've improved your previous best by ${improvement}s!`;
			} else if (this.highScoreMessage === recapMsgTypes.AVERAGE_IMPROVED) {
				const improvement = this.msToSec(Math.abs(this.amountFasterThanAverage));
				return `You were ${improvement}s faster than your previous average!`;
			} else {
				return;
			}
		},

		// other
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
.modal-header {
	@apply bg-teal-600 text-white text-center py-3 px-3;
}
.time-container {
	@apply mb-2 mt-1 inline-block mx-auto;
}
.time {
	@apply text-2xl;
}
.record-type {
	@apply bg-white text-teal-700 text-base inline-block px-2 py-1 rounded-full my-1 font-medium;
	min-width: 13rem;
}

.overview {
	@apply grid text-center mx-auto mb-6;
	grid-template-rows: repeat(3, auto);
	grid-template-columns: auto 1fr 1fr auto;
	grid-template-areas:
		"solved solved solved solved"
		"gl average best gr"
		"stats stats stats stats";
	gap: 1rem 3rem;
}

.overview-label {
	@apply text-xs opacity-80 text-left;
}
.overview .average {
	grid-area: average;
	@apply text-left;
}
.overview .best {
	grid-area: best;
	@apply text-right ml-auto;
}
.overview .best .overview-value {
	@apply text-left;
}
.overview .solved {
	grid-area: solved;
	@apply text-center;
}
.overview .stats-recap {
	grid-area: stats;
	@apply px-4 border-t border-b pb-3 pt-1 border-gray-200;
}
.highscore-msg {
	@apply text-sm mt-2 mb-1;
}

.stats-btn {
	@apply inline-flex w-2/3 justify-center items-center font-medium cursor-pointer py-1 text-gray-700;
}
.stats-btn .material-icons {
	@apply text-sm mr-1 opacity-90;
}
</style>