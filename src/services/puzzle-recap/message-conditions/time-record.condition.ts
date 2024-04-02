import type { GameEndStats } from "../GameEndStats.js";
import { getPercentageFaster, getPercentageSlower } from "../helpers.js";
import type { RecapMessageConditionResult } from "../types.js";

export const isSolvedWithLargeTimeRecord = (
	stats: Pick<GameEndStats, 'bestAndAverage' | 'historyEntry'>
): RecapMessageConditionResult<{
	percentageFaster: number
}> => {
	if (!stats.bestAndAverage.isTimeRecord) return { success: false };
	const { previousBest } = stats.bestAndAverage;
	if (previousBest == null) return { success: false };
	const time = stats.historyEntry.timeElapsed;
	const improvement = previousBest - time;
	const percentageFaster = getPercentageFaster(previousBest, time);

	if (percentageFaster < 0.35 && improvement < 10000) return { success: false };

	return {
		success: true,
		data: { percentageFaster }
	}
}

export const isSolvedWithTimeRecord = (
	stats: Pick<GameEndStats, 'bestAndAverage' | 'historyEntry'>
): RecapMessageConditionResult<{
	timeImprovement: number;
}> => {
	if (!stats.bestAndAverage.isTimeRecord) return { success: false };
	const { previousBest } = stats.bestAndAverage;
	if (previousBest == null) return { success: false };
	const time = stats.historyEntry.timeElapsed;
	const timeImprovement = previousBest - time;
	// TODO: sometimes use percentageFaster in message instead of time improvement
	// const percentageFaster = getPercentageFaster(previousBest, time);
	return {
		success: true,
		data: { timeImprovement }
	};
}

export const isAlmostTimeRecord = (
	stats: GameEndStats
): RecapMessageConditionResult<{
	timeSlower: number,
	percentageSlower: number,
	byPercentage: boolean, byTime: boolean
}> => {
	const count = stats.currentCounts.count;
	// if less than 10 played, "almostTimeRecord" is not relevant enough
	if (count < 10) return { success: false };
	const { timeElapsed } = stats.historyEntry;
	const { isTimeRecord, best, average } = stats.bestAndAverage;

	// can not be "almost" timeRecord if it is the best time
	if (isTimeRecord) return { success: false };
	// if the time is slower than average, "almostTimeRecord" is too positive
	if (timeElapsed > average) return { success: false };

	console.log('checking for almost time record');

	const timeDifference = timeElapsed - best;
	const percentageDifference = getPercentageSlower(best, timeElapsed);

	const isSuccessByPercentage = timeDifference < 6000 && percentageDifference < 0.05;
	const isSuccessByTime = timeDifference < 800 && percentageDifference < 0.20;

	console.log({ timeDifference, percentageDifference, isSuccessByPercentage, isSuccessByTime });

	if (isSuccessByPercentage || isSuccessByTime) {
		return {
			success: true,
			data: {
				timeSlower: timeDifference,
				percentageSlower: percentageDifference,

				byPercentage: isSuccessByPercentage,
				byTime: isSuccessByTime
			}
		};
	} else {
		return { success: false };
	}
}