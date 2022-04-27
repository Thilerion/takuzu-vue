import { checkImprovementOverPreviousBest, checkIsTimeRecord, createResult, dimensionsString, falseResult, getPercentageFaster, getPercentageSlower, oneOfOrMultipleOf, trueResult } from "./helpers";

export const firstSolvedTotal = data => {
	const { totalSolved } = data;
	return createResult(
		totalSolved === 1,
		{ totalSolved }
	)
}

export const hardestPuzzleSolved = (data) => {
	if (!data.isFirstSolvedWithPuzzleConfig) {
		return falseResult();
	}
	const configsPlayed = data.puzzleConfigsPlayed;
	const lastWidth = data.lastPuzzleEntry.width;
	const lastHeight = data.lastPuzzleEntry.height;
	const lastDifficulty = data.lastPuzzleEntry.difficulty;

	const hardestPlayed = configsPlayed.at(-1);
	const result = hardestPlayed.width === lastWidth && hardestPlayed.height === lastHeight && hardestPlayed.difficulty === lastDifficulty;
	return createResult(result);
}

export const firstOfDifficulty = ({
	itemsPlayedWithDifficulty, itemsPlayedWithSize, lastPuzzleEntry
}) => {
	return createResult(
		itemsPlayedWithDifficulty === 1 && itemsPlayedWithSize > 1,
		{ difficulty: lastPuzzleEntry.difficulty }
	)
}
export const firstOfSize = ({
	lastPuzzleEntry,
	itemsPlayedWithSize,
	itemsPlayedWithDifficulty
}) => {
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
}) => {
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
}) => {
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
}) => {
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

export const isAlmostTimeRecordAbsolute = ({
	count,
	currentTimeElapsed: time,
	best
}) => {
	if (count < 10) return falseResult();
	const difference = time - best;
	const percentageSlower = getPercentageSlower(best, time);
	return createResult(difference < 800 && percentageSlower < 0.17, { difference, differencePercentage: percentageSlower, time, best });
}
export const isAlmostTimeRecordPercentage = data => {
	if (data.count < 10) return falseResult();
	const { currentTimeElapsed: time, best } = data;
	const difference = time - best;
	if (difference > 6000) return falseResult();

	const percentageSlower = getPercentageSlower(best, time);

	return createResult(percentageSlower < 0.05, {
		time, best, difference, differencePercentage: percentageSlower
	});
}

export const isBetterThanAverage = data => {
	if (data.count < 3) return falseResult();
	const { currentTimeElapsed: time, previousAverage } = data;
	const difference = previousAverage - time;
	return createResult(
		difference > 0,
		{ time, previousAverage, difference }
	)
}

export const isMuchBetterThanAverageAbsolute = data => {
	if (data.count < 3) return falseResult();
	const { currentTimeElapsed: time, previousAverage } = data;
	const difference = previousAverage - time;
	return createResult(
		difference > 45000,
		{ time, previousAverage, difference }
	);
}

export const isMuchBetterThanAveragePercentage = data => {
	if (data.count < 5) return falseResult();
	const { previousAverage, currentTimeElapsed: time } = data;

	const percentageFaster = getPercentageFaster(previousAverage, time);
	return createResult(
		percentageFaster >= 0.25,
		{ previousAverage, time, improvementPercentage: percentageFaster }
	)
}


export const playsTotal = (data) => {
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
}) => {
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

export const playsToday = (data) => {
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
}) => {
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

