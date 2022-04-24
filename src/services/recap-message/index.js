import { createResult, pickRandomly } from "./helpers";
import { firstOfDifficulty, firstOfSize, firstSolvedTotal, firstWithSizeDifficulty, hardestPuzzleSolved, isAlmostTimeRecordAbsolute, isAlmostTimeRecordPercentage, isBetterThanAverage, isLargeTimeRecord, isMuchBetterThanAverageAbsolute, isMuchBetterThanAveragePercentage, isTimeRecord, playsToday, playsTodayWithConfig, playsTotal, playsTotalWithConfig } from "./recap-message-types"

export const RECAP_MSG_TYPES = {
	"FIRST_TOTAL": "FIRST_TOTAL",
	
    "HARDEST_EVER": "HARDEST_EVER",
    "FIRST_OF_DIFFICULTY": "FIRST_OF_DIFFICULTY",
    "FIRST_OF_SIZE": "FIRST_OF_SIZE",
	"FIRST_OF_SIZE_DIFFICULTY": "FIRST_OF_SIZE_DIFFICULTY",
	
    "TIME_RECORD_LARGE": "TIME_RECORD_LARGE",
	"TIME_RECORD": "TIME_RECORD",
	
    "ALMOST_TIME_RECORD_ABSOLUTE": "ALMOST_TIME_RECORD_ABSOLUTE",
	"ALMOST_TIME_RECORD_PERCENTAGE": "ALMOST_TIME_RECORD_PERCENTAGE",
	
    "MUCH_BETTER_THAN_AVERAGE_ABSOLUTE": "MUCH_BETTER_THAN_AVERAGE_ABSOLUTE",
    "MUCH_BETTER_THAN_AVERAGE_PERCENTAGE": "MUCH_BETTER_THAN_AVERAGE_PERCENTAGE",
	"BETTER_THAN_AVERAGE": "BETTER_THAN_AVERAGE",
	
    "WORST_EVER": "WORST_EVER", // TODO
	"NEARLY_WORST_EVER": "NEARLY_WORST_EVER", // TODO
	
    "PLAYS_TOTAL": "PLAYS_TOTAL",
    "PLAYS_TODAY": "PLAYS_TODAY",
    "PLAYS_CONFIG_TOTAL": "PLAYS_CONFIG_TOTAL",
	"PLAYS_CONFIG_TODAY": "PLAYS_CONFIG_TODAY",
	
    "DEFAULT": "DEFAULT"
}

const recapFnsOrdered = [
	{ type: RECAP_MSG_TYPES.FIRST_TOTAL, fn: firstSolvedTotal },

	[
		{ type: RECAP_MSG_TYPES.HARDEST_EVER, fn: hardestPuzzleSolved },
		{ type: RECAP_MSG_TYPES.FIRST_OF_DIFFICULTY, fn: firstOfDifficulty },
		{ type: RECAP_MSG_TYPES.FIRST_OF_SIZE, fn: firstOfSize },
		{ type: RECAP_MSG_TYPES.FIRST_OF_SIZE_DIFFICULTY, fn: firstWithSizeDifficulty },
	],

	{ type: RECAP_MSG_TYPES.TIME_RECORD_LARGE, fn: isLargeTimeRecord },
	{ type: RECAP_MSG_TYPES.TIME_RECORD, fn: isTimeRecord },
	{ type: RECAP_MSG_TYPES.ALMOST_TIME_RECORD_ABSOLUTE, fn: isAlmostTimeRecordAbsolute },
	{ type: RECAP_MSG_TYPES.ALMOST_TIME_RECORD_PERCENTAGE, fn: isAlmostTimeRecordPercentage },
	{ type: RECAP_MSG_TYPES.MUCH_BETTER_THAN_AVERAGE_ABSOLUTE, fn: isMuchBetterThanAverageAbsolute },
	{ type: RECAP_MSG_TYPES.MUCH_BETTER_THAN_AVERAGE_PERCENTAGE, fn: isMuchBetterThanAveragePercentage },
	{ type: RECAP_MSG_TYPES.BETTER_THAN_AVERAGE, fn: isBetterThanAverage },

	[
		{ type: RECAP_MSG_TYPES.PLAYS_TOTAL, fn: playsTotal },
		{ type: RECAP_MSG_TYPES.PLAYS_TODAY, fn: playsToday },
		{ type: RECAP_MSG_TYPES.PLAYS_CONFIG_TOTAL, fn: playsTotalWithConfig },
		{ type: RECAP_MSG_TYPES.PLAYS_CONFIG_TODAY, fn: playsTodayWithConfig },
	],
];

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