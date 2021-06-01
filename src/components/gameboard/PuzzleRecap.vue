<template>
	<div class="bg-white text-gray-900 w-full m-auto rounded overflow-hidden">
		<header class="modal-header">
			<div>
				<div class="time-container">
					<span class="time">{{time}}</span>
				</div>
			</div>
			<div
				class="highscore-banner"
				v-if="recordTypeMsg"
			><span class="material-icons highscore-icon">emoji_events</span> {{recordTypeMsg}}</div>
		</header>
		<div class="inner px-6 pt-4 pb-6 text-sm">
			<div class="text-center flex">
				<div class="overview">

					<div class="overview-item puzzle-type left">
						<div class="overview-label">Puzzle type</div>
						<div class="overview-value">{{dimensions}} - {{difficulty}}*</div>
					</div>

					<div class="overview-item num-solved right">
						<div class="overview-label">Solved</div>
						<div class="overview-value">{{count}}</div>
					</div>

					<div class="overview-item average left">
						<div class="overview-label">Average time</div>
						<div class="overview-value">{{average}}</div>
					</div>

					<div class="overview-item best right">
						<div class="overview-label">Best time</div>
						<div class="overview-value"><span class="strikethrough" v-if="isTimeRecord && !isFirstPuzzleSolved">{{prevBestFormatted}}</span> {{best}}</div>
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
			
			<div class="recap-btns">
				<BaseButton class="play-again-btn btn-primary w-full" @click="$emit('exit-to', 'play-again')">Play again</BaseButton>
				<div class="secondary-btns flex w-full">
					<BaseButton class="mr-2 text-xs flex-1" @click="$emit('exit-to', 'home')">Home</BaseButton>
					<BaseButton class="text-xs btn-small flex-1" @click="$emit('exit-to', 'new-game')">Change puzzle type</BaseButton>
				</div>				
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
	data() {
		return {
			showHighscoreAnim: true
		}
	},
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
				// return 'Average improved!';
				return;
			} else return;
		},
		recapMessage() {
			if (this.highScoreMessage === recapMsgTypes.FIRST) {
				return `You've solved this puzzle for the first time, great job!`;
			} else if (this.highScoreMessage === recapMsgTypes.TIME_RECORD) {
				const improvement = this.msToSec(Math.abs(this.differenceFromBest));
				return `You've improved your best time by ${improvement}s!`;
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
		prevBestFormatted() {
			return this.msToMinSec(this.stats.secondBest ?? 0);
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
	@apply bg-gradient-to-b from-teal-600 to-teal-500 text-white text-center py-3 px-3;
}
.time-container {
	@apply mb-2 mt-1 inline-block mx-auto;
}
.time {
	@apply text-2xl;
}
.highscore-banner {
	@apply bg-white text-teal-700 text-base inline-flex px-2 rounded-full my-1 font-medium justify-center items-center h-8 leading-none;
	min-width: 13rem;
	box-shadow: 0 0 10px 4px rgba(255, 255, 255, 0.6);
}
.highscore-icon {
	@apply opacity-80 mr-1;
}


.overview {
	@apply grid text-center mx-auto mb-6;
	grid-template-rows: 1fr 1fr auto;
	grid-template-columns: auto 1fr 1fr auto;
	grid-template-areas:
		"gl type solved gr"
		"gl average best gr"
		"stats stats stats stats";
	gap: 1rem 2rem;
}

.overview-item {
	@apply w-20;
}

.overview-item.left {
	@apply text-left ml-auto;
}
.overview-item.right {
	@apply text-right ml-auto;
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
.overview .right .overview-value {
	@apply text-left;
}
.overview .num-solved {
	grid-area: solved;
}
.overview .puzzle-type {
	grid-area: type;
}

.overview .stats-recap {
	grid-area: stats;
	@apply border-t border-b pb-3 pt-1 border-gray-200;
}
.highscore-msg {
	@apply text-sm mt-2 mb-1;
}

.overview-value > .strikethrough {
	@apply line-through opacity-60;
}

.stats-btn {
	@apply inline-flex w-2/3 justify-center items-center font-medium cursor-pointer py-1 text-gray-700;
}
.stats-btn .material-icons {
	@apply text-sm mr-1 opacity-90;
}

.recap-btns {
	@apply w-9/12 flex flex-col justify-center gap-2 items-center mx-auto;
}
</style>