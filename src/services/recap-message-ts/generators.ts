import { formatDifficultyLabel, formatOrdinal, formatPercentage, recapMsToMinSec, recapMsToSec } from "./formatters";
import { RecapMsgType, type AppliesRequiredData } from "./types";
import * as RecapFn from './recap-applies-fns';

type AppliesFn<Data, Ctx> = (data: Data) => Ctx | null;
type GetMessageFn<Ctx> = (ctx: NonNullable<Ctx>) => string;

// outerFn(data)
// outerRes = null | InnerFn
// innerFn = () => innerRes
// innerRes = { type, ctx, message }

const createGenerator = <
	T extends RecapMsgType,
	Data extends AppliesRequiredData,
	AppliesRes extends { result: true }
>(
	type: T,
	appliesFn: AppliesFn<Data, AppliesRes>,
	getMessageFn: GetMessageFn<AppliesRes>
) => {
	const fn = (data: Data) => {
		const appliesRes = appliesFn(data);
		if (appliesRes == null) return null;
		return () => {
			const msg = getMessageFn(appliesRes);
			return {
				type,
				ctx: appliesRes,
				message: msg
			}
		}
	}
	return {
		type,
		fn
	}
}

export const notAddedToDbCheats = createGenerator(
	RecapMsgType.NOT_ADDED_TO_DB_CHEATS,
	RecapFn.notAddedToDatabaseCheatsUsed,
	() => "Puzzle was not saved in your history, because you used cheats."
)
export const firstTotal = createGenerator(
	RecapMsgType.FIRST_TOTAL,
	RecapFn.firstSolvedTotal,
	() => "You've solved your first puzzle ever!"
)
export const hardestEver = createGenerator(
	RecapMsgType.HARDEST_EVER,
	RecapFn.hardestPuzzleSolved,
	() => "This was the hardest puzzle you've ever solved, well done!"
)
export const firstOfDifficulty = createGenerator(
	RecapMsgType.FIRST_OF_DIFFICULTY,
	RecapFn.firstOfDifficulty,
	(ctx) => `You've solved your first ${formatDifficultyLabel(ctx.difficulty)} puzzle.`
)
export const firstOfSize = createGenerator(
	RecapMsgType.FIRST_OF_SIZE,
	RecapFn.firstOfSize,
	({ dimensions }) => `First time solving a ${dimensions} puzzle.`
)
export const firstWithSizeDifficulty = createGenerator(
	RecapMsgType.FIRST_OF_SIZE_DIFFICULTY,
	RecapFn.firstWithSizeDifficulty,
	({ dimensions, difficulty}) => `First time solving a [${dimensions}] puzzle on ${formatDifficultyLabel(difficulty)} difficulty.`
)
export const timeRecordLarge = createGenerator(
	RecapMsgType.TIME_RECORD_LARGE,
	RecapFn.isLargeTimeRecord,
	({ improvementPercentage }) => `You were an incredible ${formatPercentage(improvementPercentage)} faster than your previous best time!`
)
export const timeRecord = createGenerator(
	RecapMsgType.TIME_RECORD,
	RecapFn.isTimeRecord,
	({ difference }) => `You've improved your best time by ${recapMsToSec(difference)}s!`
)
export const replayTimeRecord = createGenerator(
	RecapMsgType.REPLAY_TIME_RECORD,
	RecapFn.isReplayTimeRecord,
	({ numPlays, difference }) => `This is the ${formatOrdinal(numPlays + 1)} time you solved this exact puzzle. You were ${recapMsToSec(difference)}s faster than your fastest time.`
)
export const almostTimeRecordAbsolute = createGenerator(
	RecapMsgType.ALMOST_TIME_RECORD_ABSOLUTE,
	RecapFn.isAlmostTimeRecordAbsolute,
	({ difference }) => `Ooph, so close to setting a new time record. The difference is just ${recapMsToSec(difference)}s.`
)
export const almostTimeRecordPercentage = createGenerator(
	RecapMsgType.ALMOST_TIME_RECORD_PERCENTAGE,
	RecapFn.isAlmostTimeRecordPercentage,
	({ differencePercentage }) => `You almost set a new time record! You were only ${formatPercentage(differencePercentage)} slower.`
)
export const muchBetterThanAverageAbsolute = createGenerator(
	RecapMsgType.MUCH_BETTER_THAN_AVERAGE_ABSOLUTE,
	RecapFn.isMuchBetterThanAverageAbsolute,
	({ difference }) => `You solved this puzzle faster than your previous average by an incredible ${recapMsToSec(difference)}s!`
)
export const muchBetterThanAveragePercentage = createGenerator(
	RecapMsgType.MUCH_BETTER_THAN_AVERAGE_PERCENTAGE,
	RecapFn.isMuchBetterThanAveragePercentage,
	({ improvementPercentage }) => `That was much faster than average! You were ${formatPercentage(improvementPercentage)} faster.`
)
export const isBetterThanAverage = createGenerator(
	RecapMsgType.BETTER_THAN_AVERAGE,
	RecapFn.isBetterThanAverage,
	({ difference }) => `You were ${recapMsToSec(difference)}s faster than your previous average.`
)

// worst ever, nearly worst ever: todo

export const replayPlaysTotal = createGenerator(
	RecapMsgType.REPLAY_PLAYS_TOTAL,
	RecapFn.replayPlaysTotal,
	({ bestPreviousTime, numPlays }) => `This is the ${formatOrdinal(numPlays + 1)} time you've solved this exact same puzzle, with your best time being ${recapMsToMinSec(bestPreviousTime)}.`
)
export const playsTotal = createGenerator(
	RecapMsgType.PLAYS_TOTAL,
	RecapFn.playsTotal,
	({ totalSolved }) => `You've solved a total of ${totalSolved} puzzles now.`
);
export const playsToday = createGenerator(
	RecapMsgType.PLAYS_TODAY,
	RecapFn.playsToday,
	({ totalSolvedToday }) => `Today, you've solved ${totalSolvedToday} puzzles.`
);
export const playsConfigTotal = createGenerator(
	RecapMsgType.PLAYS_CONFIG_TOTAL,
	RecapFn.playsTotalWithConfig,
	({ count, difficulty, dimensions }) => `You've solved a total of ${count} puzzles with ${dimensions} dimensions at ${formatDifficultyLabel(difficulty)} difficulty.`
)
export const playsConfigToday = createGenerator(
	RecapMsgType.PLAYS_CONFIG_TODAY,
	RecapFn.playsTodayWithConfig,
	({ count, difficulty, dimensions }) => `You've played ${count} puzzles with ${dimensions} dimensions today at ${formatDifficultyLabel(difficulty)} difficulty.`
)
export const defaultRecapGen = createGenerator(
	RecapMsgType.DEFAULT,
	RecapFn.defaultRecapFn,
	() => ''
)

export const recapGenerators = {
	[RecapMsgType.NOT_ADDED_TO_DB_CHEATS]: notAddedToDbCheats,
	[RecapMsgType.FIRST_TOTAL]: firstTotal,
	[RecapMsgType.HARDEST_EVER]: hardestEver,
	[RecapMsgType.FIRST_OF_DIFFICULTY]: firstOfDifficulty,
	[RecapMsgType.FIRST_OF_SIZE]: firstOfSize,
	[RecapMsgType.FIRST_OF_SIZE_DIFFICULTY]: firstWithSizeDifficulty,
	[RecapMsgType.TIME_RECORD_LARGE]: timeRecordLarge,
	[RecapMsgType.TIME_RECORD]: timeRecord,
	[RecapMsgType.REPLAY_TIME_RECORD]: replayTimeRecord,
	[RecapMsgType.ALMOST_TIME_RECORD_ABSOLUTE]: almostTimeRecordAbsolute,
	[RecapMsgType.ALMOST_TIME_RECORD_PERCENTAGE]: almostTimeRecordPercentage,
	[RecapMsgType.MUCH_BETTER_THAN_AVERAGE_ABSOLUTE]: muchBetterThanAverageAbsolute,
	[RecapMsgType.MUCH_BETTER_THAN_AVERAGE_PERCENTAGE]: muchBetterThanAveragePercentage,
	[RecapMsgType.BETTER_THAN_AVERAGE]: isBetterThanAverage,
	[RecapMsgType.REPLAY_PLAYS_TOTAL]: replayPlaysTotal,
	[RecapMsgType.PLAYS_TOTAL]: playsTotal,
	[RecapMsgType.PLAYS_TODAY]: playsToday,
	[RecapMsgType.PLAYS_CONFIG_TOTAL]: playsConfigTotal,
	[RecapMsgType.PLAYS_CONFIG_TODAY]: playsConfigToday,
	[RecapMsgType.DEFAULT]: defaultRecapGen
}

export type RecapGenMap = typeof recapGenerators;
export type RecapGenerator = RecapGenMap[RecapMsgType];