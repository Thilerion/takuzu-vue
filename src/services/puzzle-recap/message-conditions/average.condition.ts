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
	const { previousWeightedAverage } = stats.averageTimes;
	if (previousWeightedAverage == null) {
		// shouldn't happen, as count > 5, but just in case
		return { success: false };
	}

	if (isTimeRecord) return { success: false };
	if (timeElapsed >= previousWeightedAverage) return { success: false };

	const timeDifference = previousWeightedAverage - timeElapsed; // time faster than average
	const percentageDifference = getPercentageFaster(previousWeightedAverage, timeElapsed);
	
	
	// TODO: tweak all these values and checks and magic numbers
	const bestTime = stats.personalBest.best.timeElapsed;

	// Calculate the current time's proportion within the range from best to average
	const avgToBestRange = previousWeightedAverage - bestTime;
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
	} else if (timeDifference > 30_000 && (proportionInRange < 0.25 || percentageDifference > 0.32)) {
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
	const { previousWeightedAverage: previousAverage } = stats.averageTimes;
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

type SolvedFasterThanAverageConsecutivelyStatData = Pick<GameEndStats, 'getNumSolvedWithConfig' | 'personalBest' | 'averageTimes' | 'getTimeElapsed' | 'puzzleTimes'>;
function getAmountConsecutivelySolvedFasterThanAverage(
	stats: SolvedFasterThanAverageConsecutivelyStatData
): number {
	const isTimeRecord = stats.personalBest.isTimeRecord();
	if (isTimeRecord) return 0;

	const { previousWeightedAverage: previousAverage } = stats.averageTimes;
	if (previousAverage == null) return 0;

	// No time in the consecutive range may be slower than or equal to the average, and none may be the best time
	const bestTime = stats.personalBest.best.timeElapsed;
	const previousTimes = stats.puzzleTimes.timesRecentFirst;

	let consecutive = 0;
	for (let i = 0; i < previousTimes.length; i++) {
		const time = previousTimes[i];

		if (time >= previousAverage || time <= bestTime) break;
		consecutive += 1;
	}

	return consecutive;
}

export const wasSolvedFasterThanAverage3Or5TimesConsecutively = (
	stats: SolvedFasterThanAverageConsecutivelyStatData
): RecapMessageConditionResult<{ consecutiveTimes: number }> => {
	const count = stats.getNumSolvedWithConfig();
	if (count < 25) return { success: false };

	const amount = getAmountConsecutivelySolvedFasterThanAverage(stats);
	const success = amount === 3 || amount === 5;
	if (success) {
		return { success: true, data: { consecutiveTimes: amount } };
	} else {
		return { success: false };
	}
}

export const wasSolvedFasterThanAverageTenTimesExactlyConsecutively = (
	stats: SolvedFasterThanAverageConsecutivelyStatData
): RecapMessageConditionResult<{ consecutiveTimes: number }> => {
	const count = stats.getNumSolvedWithConfig();
	if (count < 75) return { success: false };

	const amount = getAmountConsecutivelySolvedFasterThanAverage(stats);

	const success = amount === 10;
	if (success) {
		return { success: true, data: { consecutiveTimes: amount } };
	} else {
		return { success: false };
	}
}

export const wasSolvedFasterThanAverageMoreThanTenTimesConsecutively = (
	stats: SolvedFasterThanAverageConsecutivelyStatData
): RecapMessageConditionResult<{ consecutiveTimes: number, min: 10 }> => {
	const count = stats.getNumSolvedWithConfig();
	if (count < 75) return { success: false };

	const amount = getAmountConsecutivelySolvedFasterThanAverage(stats);
	const success = amount > 10;
	if (success) {
		return { success: true, data: { consecutiveTimes: amount, min: 10 } };
	} else {
		return { success: false };
	}
}