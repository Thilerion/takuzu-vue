import { timeFormatter } from "@/utils/date.utils";
import { RECAP_MSG_TYPES, type RecapMessageType } from "./types";
import { DIFFICULTY_LABELS } from "@/config";
import type { DifficultyKey } from "@/lib/types.js";

const msToMinSec = timeFormatter({ padMinutes: true });
const msToSec = (ms: number) => {
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
const validDifficultyStarRatings = Object.keys(DIFFICULTY_LABELS);
const getDifficultyLabelString = (difficultyStars: DifficultyKey) => {
	if (!validDifficultyStarRatings.includes(String(difficultyStars))) {
		console.warn(`Difficulty rating with "${difficultyStars} stars" has no associated label.`);
		return `${difficultyStars}*`;
	}
	return `${DIFFICULTY_LABELS[difficultyStars]}`;
}
const formatPercentage = (value: number, { maxDigits = 0 } = {}) => {
	const opts = {
		style: 'percent',
		minimumFractionDigits: 0,
		maximumFractionDigits: maxDigits
	}
	return new Intl.NumberFormat(undefined, opts).format(value);
}
const formatOrdinal = (value: number, locale = 'en-US') => {
	const pr = new Intl.PluralRules(locale, { type: 'ordinal' });

	const suffixes = new Map([
	['one',   'st'],
	['two',   'nd'],
	['few',   'rd'],
	['other', 'th'],
	]);

	const rule = pr.select(value);
	const suffix = suffixes.get(rule);
	return `${value}${suffix}`;
}

// TODO: localize ordinal suffixes, number (percentage and time) formatting, 
export const recapI18nMessageMap: Record<RecapMessageType, (ctx: any) => ({ key: string, namedProperties?: Record<string, string | number>}) | null> = { // TODO: any as callback, could be better
	[RECAP_MSG_TYPES.NOT_ADDED_TO_DB_CHEATS]: () => ({ key: "Recap.message.notAddedToDbCheats" }),
    [RECAP_MSG_TYPES.FIRST_TOTAL]: () => ({ key: "Recap.message.firstTotal" }),
    
    [RECAP_MSG_TYPES.HARDEST_EVER]: () => ({ key: "Recap.message.hardestEver" }),
    [RECAP_MSG_TYPES.FIRST_OF_DIFFICULTY]: ({ difficulty }) => ({
        key: "Recap.message.firstOfDifficulty",
        namedProperties: { difficultyKey: getDifficultyLabelString(difficulty) }
    }),
    [RECAP_MSG_TYPES.FIRST_OF_SIZE]: ({ dimensions }) => ({
        key: "Recap.message.firstOfSize",
        namedProperties: { dimensions }
    }),
    [RECAP_MSG_TYPES.FIRST_OF_SIZE_DIFFICULTY]: ({ dimensions, difficulty }) => ({
        key: "Recap.message.firstOfSizeDifficulty",
        namedProperties: { dimensions, difficultyKey: getDifficultyLabelString(difficulty) }
    }),
    
    [RECAP_MSG_TYPES.TIME_RECORD_LARGE]: ({ improvementPercentage }) => ({
        key: "Recap.message.timeRecordLarge",
        namedProperties: { improvementPercentage }
    }),
    [RECAP_MSG_TYPES.TIME_RECORD]: ({ difference }) => ({
        key: "Recap.message.timeRecord",
        namedProperties: { differenceSec: msToSec(difference) }
    }),

    [RECAP_MSG_TYPES.REPLAY_TIME_RECORD]: ({ numPlays, difference }) => ({
        key: "Recap.message.replayTimeRecord",
        namedProperties: { numPlaysOrdinal: formatOrdinal(numPlays + 1), differenceSec: msToSec(difference) }
    }),
    
    [RECAP_MSG_TYPES.ALMOST_TIME_RECORD_ABSOLUTE]: ({ difference }) => ({
        key: "Recap.message.almostTimeRecordAbsolute",
        namedProperties: { differenceSec: msToSec(difference) }
    }),
    [RECAP_MSG_TYPES.ALMOST_TIME_RECORD_PERCENTAGE]: ({ differencePercentage }) => ({
        key: "Recap.message.almostTimeRecordPercentage",
        namedProperties: { differencePercentage }
    }),
	[RECAP_MSG_TYPES.MUCH_BETTER_THAN_AVERAGE_ABSOLUTE]: ({ difference }) => ({
        key: "Recap.message.muchBetterThanAverageAbsolute",
        namedProperties: { differenceSec: msToSec(difference) }
    }),
    [RECAP_MSG_TYPES.MUCH_BETTER_THAN_AVERAGE_PERCENTAGE]: ({ improvementPercentage }) => ({
        key: "Recap.message.muchBetterThanAveragePercentage",
        namedProperties: { improvementPercentage }
    }),
    [RECAP_MSG_TYPES.BETTER_THAN_AVERAGE]: ({ difference }) => ({
        key: "Recap.message.betterThanAverage",
        namedProperties: { differenceSec: msToSec(difference) }
    }),
    [RECAP_MSG_TYPES.WORST_EVER]: () => null, // TODO: message already set in locales
	[RECAP_MSG_TYPES.NEARLY_WORST_EVER]: () => null, // TODO: message already set in locales

	[RECAP_MSG_TYPES.REPLAY_PLAYS_TOTAL]: ({ bestPreviousTime, numPlays }) => ({
        key: "Recap.message.replayPlaysTotal",
        namedProperties: { bestPreviousTimeMinSec: msToMinSec(bestPreviousTime), numPlaysOrdinal: formatOrdinal(numPlays + 1) }
    }),
	
    [RECAP_MSG_TYPES.PLAYS_TOTAL]: ({ totalSolved }) => ({ key: "Recap.message.playsTotal", namedProperties: { totalSolved } }),
    [RECAP_MSG_TYPES.PLAYS_TODAY]: ({ totalSolvedToday }) => ({ key: "Recap.message.playsToday", namedProperties: { totalSolvedToday } }),
    [RECAP_MSG_TYPES.PLAYS_CONFIG_TOTAL]: ({ count, difficulty, dimensions }) => ({
        key: "Recap.message.playsConfigTotal",
        namedProperties: { count, dimensions, difficultyKey: getDifficultyLabelString(difficulty) }
    }),
    [RECAP_MSG_TYPES.PLAYS_CONFIG_TODAY]: ({ count, difficulty, dimensions }) => ({
        key: "Recap.message.playsConfigToday",
        namedProperties: { count, dimensions, difficultyKey: getDifficultyLabelString(difficulty) }
    }),
	
    [RECAP_MSG_TYPES.DEFAULT]: () => null
}