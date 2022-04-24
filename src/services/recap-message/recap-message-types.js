import { createResult, falseResult, oneOfOrMultipleOf, relativeGrowth, trueResult } from "./helpers";

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

export const firstOfDifficulty = (data) => createResult(data.itemsPlayedWithDifficulty === 1 && data.itemsPlayedWithSize > 1);
export const firstOfSize = data => createResult(data.itemsPlayedWithSize === 1 && data.itemsPlayedWithDifficulty > 1);
export const firstWithSizeDifficulty = data => createResult(data.count === 1 && data.previousCount === 0);

export const isTimeRecord = data => {
	if (!data.isTimeRecord) return falseResult();

	const context = {
		time: data.currentTimeElapsed,
		previousBest: data.previousBest
	}
	return trueResult(context);
}
export const isLargeTimeRecord = data => {
	if (!data.isTimeRecord || data.count < 5) return falseResult();

	const difference = data.best - data.previousBest;
	const changePercentage = relativeGrowth(data.previousBest, data.best);
	const improvementPercentage = changePercentage * -1;
	const result = difference > 10000 && improvementPercentage >= 0.25;

	if (!result) return falseResult();
	
	const context = {
		timeDifference: difference,
		improvementPercentage,
		time: data.best,
		previousBest: data.previousBest,
	}

	return trueResult(context);
}

export const isAlmostTimeRecordAbsolute = data => {
	if (data.count < 5) return falseResult();
	const difference = data.currentTimeElapsed - data.best;
	return createResult(difference > 800, { difference, time: data.currentTimeElapsed, best: data.best });
}
export const isAlmostTimeRecordPercentage = data => {
	if (data.count < 10) return falseResult();
	const { currentTimeElapsed: time, best } = data;
	const difference = time - best;
	if (difference > 6000) return falseResult();

	const differencePercentage = relativeGrowth(best, time);
	return createResult(differencePercentage > -0.1, {
		time, best, difference, differencePercentage
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
		difference > 30000,
		{ time, previousAverage, difference }
	);
}

export const isMuchBetterThanAveragePercentage = data => {
	if (data.count < 5) return falseResult();
	const { previousAverage, currentTimeElapsed: time } = data;

	const changePercentage = relativeGrowth(previousAverage, time);
	const improvementPercentage = changePercentage * -1;
	return createResult(
		improvementPercentage >= 0.25,
		{ previousAverage, time, improvementPercentage }
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
export const playsTotalWithConfig = (data) => {
	const count = data.count;
	const result = oneOfOrMultipleOf(count, {
		oneOf: [10, 20, 30, 40, 50],
		multipleOf: 25
	});
	return createResult(
		result,
		{ solvedWithConfig: count }
	)
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
export const playsTodayWithConfig = (data) => {
	const count = data.countToday;
	const result = oneOfOrMultipleOf(count, {
		multipleOf: 5
	})
	return createResult(
		result,
		{ solvedTodayWithConfig: count }
	)
}

