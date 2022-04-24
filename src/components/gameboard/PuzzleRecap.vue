<template>
	<div class="bg-white text-gray-900 w-full m-auto rounded overflow-hidden">
		<header class="modal-header">
			<div>
				<div class="time-container">
					<span class="time">{{formattedTimes.time}}</span>
				</div>
			</div>
			<div
				class="highscore-banner"
				v-if="recordTypeMsg"
			><icon-fxemoji-trophy class="highscore-icon"/> {{recordTypeMsg}}</div>
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
						<div class="overview-value">{{formattedTimes.average}}</div>
					</div>

					<div class="overview-item best right">
						<div class="overview-label">Best time</div>
						<div class="overview-value"><span class="strikethrough" v-if="isTimeRecord && !isFirstPuzzleSolved">{{formattedTimes.prevBest}}&nbsp;</span>{{formattedTimes.best}}</div>
					</div>

					<div
						class="stats-recap"
					>
						<div v-if="highScoreMessage" class="highscore-msg">{{recapMessage}}</div>
						<button
							class="stats-btn"
							@click="$emit('exit-to', 'statistics')"
						><span class="material-icons"><icon-ic-baseline-leaderboard/></span> View all statistics</button>
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
import { useRecapStatsStore } from '@/stores/recap-stats';
import { timeFormatter } from '@/utils/date.utils.js';
import { storeToRefs } from 'pinia';
import { computed, ref, toRefs } from 'vue';
import { getRecapMessageType } from '@/services/recap-message/index.js';
const msToMinSec = timeFormatter({ padMinutes: true });
const msToSec = (ms) => {
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

const recapMsgTypes = {
	FIRST: 'first puzzle solved',
	TIME_RECORD: 'time record',
	NEARLY_TIME_RECORD: 'nearly time record',
	FIRST_OF_DIFFICULTY: 'first time playing difficulty with this size',
	FIRST_OF_SIZE: 'first time playing board size with this difficulty',
	AVERAGE_IMPROVED: 'better than average',
	DEFAULT: 'none'
};

function selectRecapMessage(data) {
	// first time size (not difficulty) OR first time difficulty (not size)
	// first puzzle solved
	// time record
	// nearly time record
	// much better than average OR better than average
	// amount played today
	// default: none

	const newRecapMsg = getRecapMessageType(data);
	console.log({ newRecapMsg});

	

	if (data.isFirstSolvedWithDifficulty && !data.isFirstSolvedWithSize) {
		return recapMsgTypes.FIRST_OF_DIFFICULTY;
	}
	if (!data.isFirstSolvedWithDifficulty && data.isFirstSolvedWithSize) {
		return recapMsgTypes.FIRST_OF_SIZE;
	}

	if (data.isFirstSolvedWithPuzzleConfig) {
		return recapMsgTypes.FIRST;
	} 
	if (data.isTimeRecord) {
		return recapMsgTypes.TIME_RECORD;
	}

	// check if nearly time record
	if (isNearlyTimeRecord(data)) {
		return recapMsgTypes.NEARLY_TIME_RECORD;
	}

	if (data.differencePreviousAverage < 0) {
		return recapMsgTypes.AVERAGE_IMPROVED;
	}
	return recapMsgTypes.DEFAULT;
}

function isNearlyTimeRecord({
	count, best, timeElapsed, previousAverage
}) {
	if (count < 10) return false;
	if (timeElapsed <= previousAverage) return false;
	// only if time difference is less than 1s
	return timeElapsed - best <= 1000;
}
</script>

<script setup>
const recapStatsStore = useRecapStatsStore();
const {
	isTimeRecord,
	count,
} = storeToRefs(recapStatsStore);
const {
	difficulty, width, height
} = toRefs(recapStatsStore.lastPuzzleEntry);


const dimensions = computed(() => `${width.value}x${height.value}`);

const times = computed(() => ({
	time: recapStatsStore.currentTimeElapsed,
	best: recapStatsStore.best,
	prevBest: recapStatsStore.previousBest,
	average: recapStatsStore.average,
	prevAverage: recapStatsStore.previousAverage
}))
const formattedTimes = computed(() => {
	const result = {};
	for (const [key, value] of Object.entries(times.value)) {
		if (value != null) result[key] = msToMinSec(value);
		else result[key] = 'none';
	}
	return result;
})

const recordTypeMsg = ref('Record type msg');
const highScoreMessage = ref('Highscore msg');
// const recapMessage = ref('Recap msg');
const recapMessage = computed(() => {
	if (!recapStatsStore.initialized) return 'not initialized';
	return selectRecapMessage(recapStatsStore);
})

const isFirstPuzzleSolved = computed(() => false);


/*
computed: {
		// records/ messages/ high score checks
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
		time() { // ok
			return this.msToMinSec(this.lastPuzzle.timeElapsed);
		},
		average() { // ok
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
*/
</script>

<style scoped>
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
	@apply bg-white text-teal-700 text-base inline-flex pr-2 pl-1 rounded-full my-1 font-medium justify-center items-center h-8 leading-none;
	min-width: 13rem;
	box-shadow: 0 0 10px 4px rgba(255, 255, 255, 0.6);
}
.highscore-icon {
	@apply mr-2;
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
	@apply text-base mr-1 opacity-90;
}

.recap-btns {
	@apply w-9/12 flex flex-col justify-center gap-2 items-center mx-auto;
}
</style>