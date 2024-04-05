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
	
	
	// TODO: tweak all these values and checks and magic numbers
	const bestTime = stats.personalBest.best.timeElapsed;

	// Calculate the current time's proportion within the range from best to average
	const avgToBestRange = previousAverage - bestTime;
    const proportionInRange = (timeElapsed - bestTime) / avgToBestRange;
	// When proportionInRange is closer to < 0.5, the current time is closer to the best time than to the average time.

	let success = false;
	// To determine whether the currently set time is "MUCH" faster than average:
	// 1. Determine based on absolute time difference (45s faster than average) with loose requirements of proportion in range and percentage difference
	if (timeDifference > 45_000 && proportionInRange < 0.60 && percentageDifference > 0.15) {
		success = true;
	} else if (proportionInRange < 0.20) {
		// 2. Determine based on strict proportion in range (so much closer to best time than average time)
		success = true;
	} else if (percentageDifference > 0.35) {
		// 3. Determine based on strict percentage difference from average
		success = true;
	} else if (timeDifference > 30_000 && (proportionInRange < 0.30 || percentageDifference > 0.3)) {
		success = true;
	}	

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