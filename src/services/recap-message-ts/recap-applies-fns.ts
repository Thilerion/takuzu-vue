import { checkImprovementOverPreviousBest, checkIsTimeRecord, dimensionsString, getPercentageFaster, getPercentageSlower, oneOfOrMultipleOf } from "./helpers";
import type { AppliesRequiredData } from "./types";

const falseResult = () => null;
const trueResult = <T>(ctx: T) => ({ result: true as const, ...ctx });
const createResult = <T>(val: boolean, ctx: T) => {
	if (!val) return falseResult();
	return trueResult(ctx);
}

export const notAddedToDatabaseCheatsUsed = (data: AppliesRequiredData) => {
	const { isSavedToDb, lastPuzzleEntry } = data;
	const cheatsUsedB = lastPuzzleEntry?.flags?.cheatsUsed;
	const cheatsUsed = cheatsUsedB !== undefined && !!cheatsUsedB;
	console.log({ isSavedToDb, cheatsUsed });
	return createResult(
		!data.isSavedToDb && !!data.lastPuzzleEntry.flags.cheatsUsed,
		{}
	)
}

export const firstSolvedTotal = (data: AppliesRequiredData) => {
	const { totalSolved } = data;
	return createResult(
		totalSolved === 1,
		{ totalSolved }
	)
}

export const hardestPuzzleSolved = (data: AppliesRequiredData) => {
	if (!data.isFirstSolvedWithPuzzleConfig) {
		return falseResult();
	}
	const configsPlayed = data.puzzleConfigsPlayed;
	const lastWidth = data.lastPuzzleEntry.width;
	const lastHeight = data.lastPuzzleEntry.height;
	const lastDifficulty = data.lastPuzzleEntry.difficulty;

	const hardestPlayed = configsPlayed.at(-1)!;
	const result = hardestPlayed.width === lastWidth && hardestPlayed.height === lastHeight && hardestPlayed.difficulty === lastDifficulty;
	return createResult(result, {});
}

export const firstOfDifficulty = ({
	itemsPlayedWithDifficulty, itemsPlayedWithSize, lastPuzzleEntry
}: AppliesRequiredData) => {
	return createResult(
		itemsPlayedWithDifficulty === 1 && itemsPlayedWithSize > 1,
		{ difficulty: lastPuzzleEntry.difficulty }
	)
}
export const firstOfSize = ({
	lastPuzzleEntry,
	itemsPlayedWithSize,
	itemsPlayedWithDifficulty
}: AppliesRequiredData) => {
	const result = itemsPlayedWithSize === 1 && itemsPlayedWithDifficulty > 1;
	if (!result) return falseResult();
	const { width, height, difficulty } = lastPuzzleEntry;
	const context = {
		width, height, difficulty,
		dimensions: dimensionsString(width, height)
	}
	return trueResult(context);
}
export const firstWithSizeDifficulty = ({
	lastPuzzleEntry,
	count,
	previousCount
}: AppliesRequiredData) => {
	const result = count === 1 && previousCount === 0;
	if (!result) return falseResult();
	const { width, height, difficulty } = lastPuzzleEntry;
	const context = {
		width, height, difficulty,
		dimensions: dimensionsString(width, height)
	}
	return trueResult(context);
}

export const isTimeRecord = ({
	currentTimeElapsed: time,
	previousBest,
	best
}: AppliesRequiredData) => {
	const isTimeRecord = checkIsTimeRecord({ time, best, previousBest });
	if (!isTimeRecord) return falseResult();
	const difference = checkImprovementOverPreviousBest({
		time, best, previousBest
	});
	return trueResult({
		time,
		previousBest,
		difference,
		improvement: difference
	})
}
export const isLargeTimeRecord = ({
	count, currentTimeElapsed: time,
	previousBest, best
}: AppliesRequiredData) => {
	if (count < 5 || !checkIsTimeRecord({
		time, best, previousBest
	})) return falseResult();

	const difference = checkImprovementOverPreviousBest({
		time, best, previousBest
	});
	const percentageFaster = getPercentageFaster(previousBest, time);
	const result = difference > 10000 && percentageFaster >= 0.35;

	return createResult(
		result,
		{
			timeDifference: difference,
			improvementPercentage: percentageFaster,
			time,
			previousBest
		}
	)
}

export const isReplayTimeRecord = ({
	isReplay,
	previousPlays,
	currentTimeElapsed: time
}: AppliesRequiredData) => {
	if (!isReplay) return falseResult();
	const bestPreviousTime = Math.min(...previousPlays.map(val => val.timeElapsed));
	const difference = bestPreviousTime - time;
	if (difference <= 0) return falseResult();
	const numPlays = previousPlays.length;
	return trueResult({
		numPlays,
		difference,
		time,
		bestPreviousTime
	});
}

export const isAlmostTimeRecordAbsolute = ({
	count,
	currentTimeElapsed: time,
	best
}: AppliesRequiredData) => {
	if (count < 10) return falseResult();
	const difference = time - best;
	const percentageSlower = getPercentageSlower(best, time);
	return createResult(difference < 800 && percentageSlower < 0.17, { difference, differencePercentage: percentageSlower, time, best });
}
export const isAlmostTimeRecordPercentage = (data: AppliesRequiredData) => {
	if (data.count < 10) return falseResult();
	const { currentTimeElapsed: time, best } = data;
	const difference = time - best;
	if (difference > 6000) return falseResult();

	const percentageSlower = getPercentageSlower(best, time);

	return createResult(percentageSlower < 0.05, {
		time, best, difference, differencePercentage: percentageSlower
	});
}

export const isBetterThanAverage = (data: AppliesRequiredData) => {
	if (data.count < 3) return falseResult();
	const { currentTimeElapsed: time, previousAverage } = data;
	const difference = previousAverage - time;
	return createResult(
		difference > 0,
		{ time, previousAverage, difference }
	)
}

export const isMuchBetterThanAverageAbsolute = (data: AppliesRequiredData) => {
	if (data.count < 3) return falseResult();
	const { currentTimeElapsed: time, previousAverage } = data;
	const difference = previousAverage - time;
	return createResult(
		difference > 45000,
		{ time, previousAverage, difference }
	);
}

export const isMuchBetterThanAveragePercentage = (data: AppliesRequiredData) => {
	if (data.count < 5) return falseResult();
	const { previousAverage, currentTimeElapsed: time } = data;

	const percentageFaster = getPercentageFaster(previousAverage, time);
	return createResult(
		percentageFaster >= 0.25,
		{ previousAverage, time, improvementPercentage: percentageFaster }
	)
}

export const replayPlaysTotal = ({
	isReplay,
	previousPlays,
}: AppliesRequiredData) => {
	if (!isReplay) return falseResult();
	const bestPreviousTime = Math.min(
		...previousPlays.map(item => item.timeElapsed)
	);
	const numPlays = previousPlays.length;
	return trueResult({
		bestPreviousTime,
		numPlays
	})
}


export const playsTotal = (data: AppliesRequiredData) => {
	const count = data.totalSolved;
	const result = oneOfOrMultipleOf(count, {
		oneOf: [25, 50, 75],
		multipleOf: 50
	});
	return createResult(
		result,
		{ totalSolved: count }
	)
}
export const playsTotalWithConfig = ({
	count, lastPuzzleEntry
}: AppliesRequiredData) => {
	const result = oneOfOrMultipleOf(count, {
		oneOf: [10, 20, 30, 40, 50],
		multipleOf: 25
	});
	if (!result) return falseResult();
	const { width, height, difficulty } = lastPuzzleEntry;
	return trueResult({
		count,
		width, height,
		difficulty,
		dimensions: dimensionsString(width, height)
	})
}

export const playsToday = (data: AppliesRequiredData) => {
	const count = data.totalSolvedToday;
	const result = oneOfOrMultipleOf(count, {
		multipleOf: 5
	})
	return createResult(
		result,
		{ totalSolvedToday: count }
	)
}
export const playsTodayWithConfig = ({
	countToday: count, lastPuzzleEntry
}: AppliesRequiredData) => {
	const result = oneOfOrMultipleOf(count, {
		multipleOf: 5
	})
	if (!result) return falseResult();
	const { width, height, difficulty } = lastPuzzleEntry;
	return trueResult({
		count,
		width, height,
		difficulty,
		dimensions: dimensionsString(width, height)
	})
}

export const defaultRecapFn = () => trueResult({});