import { falseResult, pickRandomly } from "./helpers";
import { firstOfDifficulty, firstOfSize, firstSolvedTotal, firstWithSizeDifficulty, hardestPuzzleSolved, isAlmostTimeRecordAbsolute, isAlmostTimeRecordPercentage, isBetterThanAverage, isLargeTimeRecord, isMuchBetterThanAverageAbsolute, isMuchBetterThanAveragePercentage, isReplayTimeRecord, isTimeRecord, notAddedToDatabaseCheatsUsed, playsToday, playsTodayWithConfig, playsTotal, playsTotalWithConfig, replayPlaysTotal } from "./recap-message-types"
import { RECAP_MSG_TYPES } from "./types";

const recapFnsOrdered = [
	{ type: RECAP_MSG_TYPES.NOT_ADDED_TO_DB_CHEATS, fn: notAddedToDatabaseCheatsUsed },
	{ type: RECAP_MSG_TYPES.FIRST_TOTAL, fn: firstSolvedTotal },

	[
		{ type: RECAP_MSG_TYPES.HARDEST_EVER, fn: hardestPuzzleSolved },
		{ type: RECAP_MSG_TYPES.FIRST_OF_DIFFICULTY, fn: firstOfDifficulty },
		{ type: RECAP_MSG_TYPES.FIRST_OF_SIZE, fn: firstOfSize },
		{ type: RECAP_MSG_TYPES.FIRST_OF_SIZE_DIFFICULTY, fn: firstWithSizeDifficulty },
	],

	{ type: RECAP_MSG_TYPES.TIME_RECORD_LARGE, fn: isLargeTimeRecord },
	{ type: RECAP_MSG_TYPES.TIME_RECORD, fn: isTimeRecord },

	{ type: RECAP_MSG_TYPES.REPLAY_TIME_RECORD, fn: isReplayTimeRecord },

	{ type: RECAP_MSG_TYPES.ALMOST_TIME_RECORD_ABSOLUTE, fn: isAlmostTimeRecordAbsolute },
	{ type: RECAP_MSG_TYPES.ALMOST_TIME_RECORD_PERCENTAGE, fn: isAlmostTimeRecordPercentage },
	{ type: RECAP_MSG_TYPES.MUCH_BETTER_THAN_AVERAGE_ABSOLUTE, fn: isMuchBetterThanAverageAbsolute },
	{ type: RECAP_MSG_TYPES.MUCH_BETTER_THAN_AVERAGE_PERCENTAGE, fn: isMuchBetterThanAveragePercentage },
	{ type: RECAP_MSG_TYPES.BETTER_THAN_AVERAGE, fn: isBetterThanAverage },

	{ type: RECAP_MSG_TYPES.WORST_EVER, fn: () => falseResult() }, // TODO
	{ type: RECAP_MSG_TYPES.NEARLY_WORST_EVER, fn: () => falseResult() }, // TODO

	{ type: RECAP_MSG_TYPES.REPLAY_PLAYS_TOTAL, fn: replayPlaysTotal },

	[
		{ type: RECAP_MSG_TYPES.PLAYS_TOTAL, fn: playsTotal },
		{ type: RECAP_MSG_TYPES.PLAYS_TODAY, fn: playsToday },
		{ type: RECAP_MSG_TYPES.PLAYS_CONFIG_TOTAL, fn: playsTotalWithConfig },
		{ type: RECAP_MSG_TYPES.PLAYS_CONFIG_TODAY, fn: playsTodayWithConfig },
	],
];

export function getRecordMessageData(recapMessageData, recapStats) {
	const { type = RECAP_MSG_TYPES.DEFAULT } = recapMessageData;
	if (type === RECAP_MSG_TYPES.FIRST_TOTAL) {
		return {
			show: true,
			message: 'First puzzle solved!'
		};
	} else if ([
		RECAP_MSG_TYPES.TIME_RECORD,
		RECAP_MSG_TYPES.TIME_RECORD_LARGE
	].includes(type)) {
		return {
			show: true,
			message: 'New time record!'
		}
	}

	if (recapStats.count === 1) {
		return {
			show: true,
			message: 'First puzzle solved!'
		}
	}
	return { show: false };
}

export function getRecapMessageType(recapStats) {
	for (const item of recapFnsOrdered) {
		if (Array.isArray(item)) {
			// do all of them, pick one randomly
			const groupResults = item.map(i => {
				const { type, fn } = i;
				const { result, context } = fn(recapStats);
				return { result, type, context };
			}).filter(val => val != null && val.result);
			if (groupResults.length) {
				return pickRandomly(groupResults);
			}
		} else {
			const { type, fn } = item;
			const { result, context } = fn(recapStats);
			if (result) {
				return {
					result, type, context
				}
			}
		}
	}
	return {
		type: RECAP_MSG_TYPES.DEFAULT,
		result: true,
		context: {}
	}
}