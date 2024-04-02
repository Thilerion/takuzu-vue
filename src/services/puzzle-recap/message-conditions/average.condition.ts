import type { GameEndStats } from "../GameEndStats.js";
import { getPercentageFaster } from "../helpers.js";
import type { RecapMessageConditionResult } from "../types.js";

export const wasSolvedMuchFasterThanAverageTime = (
	stats: Pick<GameEndStats, 'currentCounts' | 'averageTimes' | 'personalBest' | 'getTimeElapsed'>
): RecapMessageConditionResult<{
	percentageDifference: number,
	timeDifference: number
}> => {
	const count = stats.currentCounts.count;
	// if less than 6 played, "muchBetterThanAverage" is not relevant enough
	if (count < 6) return { success: false };
	const timeElapsed = stats.getTimeElapsed();
	const isTimeRecord = stats.personalBest.isTimeRecord();
	const { previousAverage: average } = stats.averageTimes;
	if (average == null) {
		// shouldn't happen, as count > 5, but just in case
		return { success: false };
	}

	if (isTimeRecord) return { success: false };
	if (timeElapsed >= average) return { success: false };

	const timeDifference = average - timeElapsed; // time faster than average
	const percentageDifference = getPercentageFaster(average, timeElapsed);

	const success = 
		(timeDifference > 45000) ||
		(timeDifference > 30000 && percentageDifference > 0.5) ||
		(timeDifference > 10000 && percentageDifference > 0.3);

	if (!success) return { success: false };
	return {
		success: true,
		data: {
			// timeElapsed, average,
			timeDifference, percentageDifference
		}
	}
}

export const wasSolvedFasterThanAverageTime = (
	stats: Pick<GameEndStats, 'currentCounts' | 'personalBest' | 'averageTimes' | 'getTimeElapsed'>
): RecapMessageConditionResult<{
	timeDifference: number
}> => {
	const count = stats.currentCounts.count;
	// if less than 4 played, "betterThanAverage" is not relevant enough
	if (count < 4) return { success: false };
	const timeElapsed = stats.getTimeElapsed();
	const isTimeRecord = stats.personalBest.isTimeRecord();
	const { previousAverage: average } = stats.averageTimes;
	// shouldn't happen, as count > 3, but just in case
	if (average == null) return { success: false };
	if (isTimeRecord || timeElapsed >= average) return { success: false };

	const timeDifference = average - timeElapsed; // time faster than average
	if (timeDifference <= 0) return { success: false };
	return {
		success: true,
		data: {
			// timeElapsed, previousAverage: average,
			timeDifference
		}
	}
}