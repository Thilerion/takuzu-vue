import type { GameEndStats } from "../GameEndStats.js";
import { getPercentageFaster } from "../helpers.js";
import type { RecapMessageConditionResult } from "../types.js";

export const wasSolvedMuchFasterThanAverageTime = (
	stats: Pick<GameEndStats, 'getNumSolvedWithConfig' | 'averageTimes' | 'personalBest' | 'getTimeElapsed'>
): RecapMessageConditionResult<{
	percentageDifference: number,
	timeDifference: number
}> => {
	const count = stats.getNumSolvedWithConfig();
	// if less than 6 played, "muchBetterThanAverage" is not relevant enough
	if (count < 6) return { success: false };
	const timeElapsed = stats.getTimeElapsed();
	const isTimeRecord = stats.personalBest.isTimeRecord();
	const { previousAverage } = stats.averageTimes;
	if (previousAverage == null) {
		// shouldn't happen, as count > 5, but just in case
		return { success: false };
	}

	if (isTimeRecord) return { success: false };
	if (timeElapsed >= previousAverage) return { success: false };

	const timeDifference = previousAverage - timeElapsed; // time faster than average
	const percentageDifference = getPercentageFaster(previousAverage, timeElapsed);

	// TODO: tweak these values
	const success = 
		(timeDifference > 45000) ||
		(timeDifference > 30000 && percentageDifference > 0.3) ||
		(timeDifference > 10000 && percentageDifference > 0.5) ||
		(timeDifference > 2500 && percentageDifference > 0.7);

	if (!success) return { success: false };
	return {
		success: true,
		data: {
			// timeElapsed, previousAverage,
			timeDifference, percentageDifference
		}
	}
}

export const wasSolvedFasterThanAverageTime = (
	stats: Pick<GameEndStats, 'getNumSolvedWithConfig' | 'personalBest' | 'averageTimes' | 'getTimeElapsed'>
): RecapMessageConditionResult<{
	timeDifference: number
}> => {
	const count = stats.getNumSolvedWithConfig();
	// if less than 4 played, "betterThanAverage" is not relevant enough
	if (count < 4) return { success: false };
	const timeElapsed = stats.getTimeElapsed();
	const isTimeRecord = stats.personalBest.isTimeRecord();
	const { previousAverage } = stats.averageTimes;
	// shouldn't happen, as count > 3, but just in case
	if (previousAverage == null) return { success: false };
	if (isTimeRecord || timeElapsed >= previousAverage) return { success: false };

	const timeDifference = previousAverage - timeElapsed; // time faster than average
	if (timeDifference <= 0) return { success: false };
	return {
		success: true,
		data: {
			// timeElapsed, previousAverage: average,
			timeDifference
		}
	}
}