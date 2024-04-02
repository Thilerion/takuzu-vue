import type { GameEndStats } from "../GameEndStats.js";
import type { RecapMessageConditionResult } from "../types.js";

export const isSolvedWithLargeTimeRecordImprovement = (
	stats: Pick<GameEndStats, 'personalBest'>
): RecapMessageConditionResult<{
	percentageFaster: number
}> => {
	if (!stats.personalBest.isTimeRecord()) return { success: false };
	const timeImprovement = stats.personalBest.getTimeImprovement();
	if (timeImprovement == null || timeImprovement < 0) return { success: false };
	const percentageFaster = stats.personalBest.getPercentageFasterThanPreviousBest();

	if (percentageFaster == null || (percentageFaster < 0.35 && timeImprovement < 10000)) return { success: false };

	return {
		success: true,
		data: { percentageFaster }
	}
}

export const isSolvedWithTimeRecord = (
	stats: Pick<GameEndStats, 'personalBest'>
): RecapMessageConditionResult<{
	timeImprovement: number;
}> => {
	if (!stats.personalBest.isTimeRecord()) return { success: false };
	const timeImprovement = stats.personalBest.getTimeImprovement();
	if (timeImprovement == null || timeImprovement < 0) return { success: false };
	// TODO: sometimes use percentageFaster in message instead of time improvement
	// const percentageFaster = getPercentageFaster(previousBest, time);
	return {
		success: true,
		data: { timeImprovement }
	};
}

export const isAlmostTimeRecord = (
	stats: Pick<GameEndStats, 'personalBest' | 'currentCounts' | 'averageTimes'>
): RecapMessageConditionResult<{
	timeSlower: number,
	percentageSlower: number,
	byPercentage: boolean, byTime: boolean
}> => {
	const count = stats.currentCounts.count;
	// if less than 10 played, "almostTimeRecord" is not relevant enough
	if (count < 10) return { success: false };
	
	// can not be "almost" timeRecord if it is the best time
	if (stats.personalBest.isTimeRecord()) return { success: false };

	const timeElapsed = stats.personalBest.current.timeElapsed;
	const average = stats.averageTimes.average;
	// if the time is slower than average, "almostTimeRecord" is too positive
	if (timeElapsed > average) return { success: false };

	const timeDifference = stats.personalBest.getTimeImprovement();
	const percentageDifference = stats.personalBest.getPercentageSlowerThanBest();
	if (timeDifference == null || percentageDifference == null) return { success: false };

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