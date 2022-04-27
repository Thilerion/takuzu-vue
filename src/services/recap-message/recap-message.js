import { timeFormatter } from "@/utils/date.utils";
import { RECAP_MSG_TYPES } from "./types";
import { DIFFICULTY_LABELS } from "@/config";

const msToMinSec = timeFormatter({ padMinutes: true });
const msToSec = ms => {
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
const getDifficultyLabelString = (difficultyStars) => {
	if (!validDifficultyStarRatings.includes(String(difficultyStars))) {
		console.warn(`Difficulty rating with "${difficultyStars} stars" has no associated label.`);
		return `${difficultyStars}*`;
	}
	return `${DIFFICULTY_LABELS[difficultyStars]}`;
}
const formatPercentage = (value, { maxDigits = 0 } = {}) => {
	const opts = {
		style: 'percent',
		minimumFractionDigits: 0,
		maximumFractionDigits: maxDigits
	}
	return new Intl.NumberFormat(undefined, opts).format(value);
}
const formatOrdinal = (value, locale = 'en-US') => {
	var pr = new Intl.PluralRules(locale, { type: 'ordinal' });

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

export const recapMessageMap = {
	[RECAP_MSG_TYPES.FIRST_TOTAL]: () => "You've solved your first puzzle ever!",
	
    [RECAP_MSG_TYPES.HARDEST_EVER]: () => "This was the hardest puzzle you've ever solved, well done!",
    [RECAP_MSG_TYPES.FIRST_OF_DIFFICULTY]: ({ difficulty }) => `You've solved your first ${getDifficultyLabelString(difficulty)} puzzle.`,
    [RECAP_MSG_TYPES.FIRST_OF_SIZE]: ({ dimensions }) => `First time solving ${dimensions} puzzle solved`,
	[RECAP_MSG_TYPES.FIRST_OF_SIZE_DIFFICULTY]: ({ dimensions, difficulty}) => `First time solving a ${dimensions} puzzle on ${getDifficultyLabelString(difficulty)} difficulty.`,
	
    [RECAP_MSG_TYPES.TIME_RECORD_LARGE]: ({ improvementPercentage }) => `Incredible! You were ${formatPercentage(improvementPercentage)} faster than your previous best time!`,
	[RECAP_MSG_TYPES.TIME_RECORD]: ({ difference }) => `New time record! You've improved your best time by ${msToSec(difference)}s!`,

	[RECAP_MSG_TYPES.REPLAY_TIME_RECORD]: ({ numPlays, difference }) => `This is the ${formatOrdinal(numPlays)} time you solved this exact puzzle. You were ${msToSec(difference)}s faster than your fastest time.`,
	
	[RECAP_MSG_TYPES.ALMOST_TIME_RECORD_ABSOLUTE]: ({ difference }) => `Ooph, so close to setting a new time record. The difference is just ${msToSec(difference)}s.`,
    [RECAP_MSG_TYPES.ALMOST_TIME_RECORD_PERCENTAGE]: ({ differencePercentage }) => `You almost set a new time record! You were only ${formatPercentage(differencePercentage)} slower.`,
	
    [RECAP_MSG_TYPES.MUCH_BETTER_THAN_AVERAGE_ABSOLUTE]: ({ difference }) => `You solved this puzzle faster than your previous average by an incredible ${msToSec(difference)}s!`,
    [RECAP_MSG_TYPES.MUCH_BETTER_THAN_AVERAGE_PERCENTAGE]: ({ improvementPercentage }) => `That was much faster than average! You were ${formatPercentage(improvementPercentage)} faster.`,
	[RECAP_MSG_TYPES.BETTER_THAN_AVERAGE]: ({ difference }) => `You were ${msToSec(difference)}s faster than your previous average.`,
	
    [RECAP_MSG_TYPES.WORST_EVER]: () => '', // TODO
	[RECAP_MSG_TYPES.NEARLY_WORST_EVER]: () => '', // TODO

	[RECAP_MSG_TYPES.REPLAY_PLAYS_TOTAL]: ({ bestPreviousTime, numPlays }) => `This is the ${formatOrdinal(numPlays)} time you've solved this exact same puzzle, with your best time being ${msToMinSec(bestPreviousTime)}.`,
	
    [RECAP_MSG_TYPES.PLAYS_TOTAL]: ({ totalSolved }) => `You've solved a total of ${totalSolved} puzzles now.`,
    [RECAP_MSG_TYPES.PLAYS_TODAY]: ({ totalSolvedToday }) => `Today, you've solved ${totalSolvedToday} puzzles.`,
    [RECAP_MSG_TYPES.PLAYS_CONFIG_TOTAL]: ({ count, difficulty, dimensions }) => `You've solved a total of ${count} ${dimensions} puzzles at ${getDifficultyLabelString(difficulty)} difficulty.`,
	[RECAP_MSG_TYPES.PLAYS_CONFIG_TODAY]: ({ count, difficulty, dimensions }) => `You've played ${count}x ${dimensions} puzzles today at ${getDifficultyLabelString(difficulty)} difficulty.`,
	
    [RECAP_MSG_TYPES.DEFAULT]: () => ''
}