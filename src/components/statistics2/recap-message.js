import { useRecapStatsStore } from "@/stores/recap-stats";

/*
1. First ever puzzle solved
2. Hardest puzzle ever solved:
	No higher difficulty played before
	Difficulty not played before on this size
	Difficulty only played before on smaller sizes, or not played before ever
3. First time playing this difficulty (but played size before)
4. First time playing this size (but difficulty played before)
5. First time playing this sizexdifficulty combination
6. Large improvement of time record
	More than 5 plays for this config
	Minimal improvement of 15 seconds
	New best time is at least 25% (?) higher than the previous
7. Time record (>1 plays)
8. Almost time record
	>2 plays
	Difference no more than 0.8 seconds
9. Almost time record (2)
	>5 plays
	Within top 5%
	Show percentage
10. Much better than average
	>10 plays
	More than 30 seconds faster
11. Much better than average (2)
	>5 plays
	top 75%
12. Better than average
	>2 plays
13. Worst time ever (>40 plays)
14. Nearly worst time ever (>40 plays, worst 5 times)
15. Played 5/10/15/20/multiple of 5 puzzles today
16. Completed this puzzle config n times today
17. Completed 10/20/30/40/50/multiple of 25 of this puzzle config in total
18. Completed 25/50/75/multiple of 100 total puzzles
*/
const RECAP_MSG = createEnum([
	'FIRST_TOTAL',
	'HARDEST_EVER',
	'FIRST_OF_DIFFICULTY',
	'FIRST_OF_SIZE',
	'FIRST_OF_SIZE_DIFFICULTY',

	'TIME_RECORD_LARGE',
	'TIME_RECORD',

	'ALMOST_TIME_RECORD_ABSOLUTE',
	'ALMOST_TIME_RECORD_PERCENTAGE',

	'MUCH_BETTER_THAN_AVERAGE_ABSOLUTE',
	'MUCH_BETTER_THAN_AVERAGE_PERCENTAGE',
	'BETTER_THAN_AVERAGE',

	'WORST_EVER', // TODO
	'NEARLY_WORST_EVER', // TODO

	'PLAYS_TOTAL',
	'PLAYS_TODAY',
	'PLAYS_CONFIG_TOTAL',
	'PLAYS_CONFIG_TODAY',

	'DEFAULT',
])

console.log(RECAP_MSG);

const getStore = () => useRecapStatsStore();

export function getRecapMessageType(recapStats = getStore()) {
	if (isFirstSolvedTotal(recapStats)) {
		return RECAP_MSG.FIRST_TOTAL;
	}
	if (isHardestPuzzleSolvedTotal(recapStats)) {
		return RECAP_MSG.HARDEST_EVER;
	}
	if (firstWithSizeDifficulty(recapStats)) {
		if (firstOfDifficulty(recapStats)) {
			return RECAP_MSG.FIRST_OF_DIFFICULTY;
		}
		if (firstOfSize(recapStats)) {
			return RECAP_MSG.FIRST_OF_SIZE;
		} else return RECAP_MSG.FIRST_OF_SIZE_DIFFICULTY;
	}

	if (isTimeRecord(recapStats)) {
		if (isLargeTimeRecord(recapStats)) {
			return RECAP_MSG.TIME_RECORD_LARGE;
		} else return RECAP_MSG.TIME_RECORD;
	}
	
	if (isAlmostTimeRecordAbsolute(recapStats)) {
		return RECAP_MSG.ALMOST_TIME_RECORD_ABSOLUTE;
	}
	if (isAlmostTimeRecordPercentage(recapStats)) {
		return RECAP_MSG.ALMOST_TIME_RECORD_PERCENTAGE;
	}
	
	if (isBetterThanAverage(recapStats)) {
		if (isMuchBetterThanAverageAbsolute(recapStats)) {
			return RECAP_MSG.MUCH_BETTER_THAN_AVERAGE_ABSOLUTE;
		} else if (isMuchBetterThanAveragePercentage(recapStats)) {
			return RECAP_MSG.MUCH_BETTER_THAN_AVERAGE_PERCENTAGE;
		} else return RECAP_MSG.BETTER_THAN_AVERAGE;
	}

	// any one of these, if found, is randonly picked
	const recapMessageWithPlays = pickRandomlyFromRecapMessages(recapStats, {
		[RECAP_MSG.PLAYS_TOTAL]: playsTotal,
		[RECAP_MSG.PLAYS_TODAY]: playsToday,
		[RECAP_MSG.PLAYS_CONFIG_TOTAL]: playsTotalWithConfig,
		[RECAP_MSG.PLAYS_CONFIG_TODAY]: playsTodayWithConfig,
	})
	if (recapMessageWithPlays) return recapMessageWithPlays;


	return RECAP_MSG.DEFAULT;
}

const isFirstSolvedTotal = ({ totalSolved }) => totalSolved === 1;

const isHardestPuzzleSolvedTotal = (data) => {
	if (!data.isFirstSolvedWithPuzzleConfig) {
		return false;
	}
	const configsPlayed = data.puzzleConfigsPlayed;
	const lastWidth = data.lastPuzzleEntry.width;
	const lastHeight = data.lastPuzzleEntry.height;
	const lastDifficulty = data.lastPuzzleEntry.difficulty;

	const hardestPlayed = configsPlayed.at(-1);
	return hardestPlayed.width === lastWidth && hardestPlayed.height === lastHeight && hardestPlayed.difficulty === lastDifficulty;
}

const firstOfDifficulty = (data) => data.itemsPlayedWithDifficulty === 1 && data.itemsPlayedWithSize > 1;
const firstOfSize = data => data.itemsPlayedWithSize === 1 && data.itemsPlayedWithDifficulty > 1;
const firstWithSizeDifficulty = data => data.count === 1 && data.previousCount === 0;

const isTimeRecord = data => data.isTimeRecord;
const isLargeTimeRecord = data => {
	if (data.count < 5) return false;
	const difference = data.best - data.previousBest;
	const changePercentage = relativeGrowth(data.previousBest, data.best);
	return difference > 10000 && changePercentage <= -0.25; 
}

const isAlmostTimeRecordAbsolute = data => {
	if (data.count < 5) return false;
	const difference = data.currentTimeElapsed - data.best;
	return difference < 800; // 0.8 seconds
}
const isAlmostTimeRecordPercentage = data => {
	if (data.count < 10) return false;
	const difference = data.currentTimeElapsed - data.best;
	// at most 6 seconds slower than time record
	if (difference > 6000) return false;

	const changePercentage = relativeGrowth(data.best, data.currentTimeElapsed);
	return changePercentage > -0.1; // within 10 percent difference
}

const isBetterThanAverage = data => {
	if (data.count < 3) return false;
	return data.currentTimeElapsed < data.average;
}

const isMuchBetterThanAverageAbsolute = (data = useRecapStatsStore()) => {
	if (data.count < 10) return false;
	const difference = data.previousAverage - data.currentTimeElapsed;
	return difference > 30000; // 30 seconds improvement
}
const isMuchBetterThanAveragePercentage = data => {
	if (data.count < 5) return false;
	const changePercentage = relativeGrowth(data.previousAverage, data.currentTimeElapsed);
	return changePercentage <= -0.25;
}

const playsTotal = (data) => {
	const count = data.totalSolved;
	return oneOfOrMultipleOf(count, {
		oneOf: [25, 50, 75],
		multipleOf: 50
	});
}
const playsTotalWithConfig = (data) => {
	const count = data.count;
	return oneOfOrMultipleOf(count, {
		oneOf: [10, 20, 30, 40, 50],
		multipleOf: 25
	});
}
const playsToday = (data) => {
	const count = data.totalSolvedToday;
	return oneOfOrMultipleOf(count, {
		multipleOf: 5
	})
}
const playsTodayWithConfig = (data) => {
	const count = data.countToday;
	return oneOfOrMultipleOf(count, {
		multipleOf: 5
	})
}

function createEnum(arr) {
	const result = {};
	for (const value of arr) {
		result[value] = value;
	}
	return result;
}

function relativeGrowth(from, to) {
	return (to - from) / Math.abs(from);
}

function isMultipleOf(value = 0, multipleOf = 5) {
	return value > 0 && value % multipleOf === 0;
}
function isOneOf(value = 0, arr = []) {
	return arr.includes(value);
}
function oneOfOrMultipleOf(value, {
	oneOf = [],
	multipleOf = 5
}) {
	if (isOneOf(value, oneOf)) return true;
	const min = Math.max(...oneOf);
	if (value <= min) return false;
	return isMultipleOf(value, multipleOf);
}

function pickRandomlyFromRecapMessages(
	data,
	recapMsgFunctionMap
) {
	const validRecapMsgs = [];

	for (const [key, fn] of Object.entries(recapMsgFunctionMap)) {
		if (fn(data)) {
			validRecapMsgs.push(key);
		}
	}
	if (!validRecapMsgs.length) return null;

	console.log('multiple found!');
	console.log({ validRecapMsgs });

	const rnd = Math.floor(Math.random() * validRecapMsgs.length);
	return validRecapMsgs[rnd];
}