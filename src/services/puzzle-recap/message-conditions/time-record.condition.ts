import type { GameEndStats, PersonalBestGameEndStats } from "../GameEndStats.js";
import type { RecapMessageConditionResult } from "../types.js";

const MIN_TIME_LARGE_IMPROVEMENT = 30_000;
const MIN_PERCENTAGE_LARGE_IMPROVEMENT = 0.35;

export const isSolvedWithLargeTimeRecordImprovement = (
	stats: Pick<GameEndStats, 'personalBest'>
): RecapMessageConditionResult<{
	percentageFaster: number
}> => {
	if (!stats.personalBest.isTimeRecord()) return { success: false };
	const timeImprovement = stats.personalBest.getTimeImprovement();
	if (timeImprovement == null || timeImprovement < 0) return { success: false };
	const percentageFaster = stats.personalBest.getPercentageFasterThanPreviousBest();

	if (percentageFaster == null) return { success: false };
	// if time and percentage improvements are BOTH below threshold, fail
	else if (
		percentageFaster < MIN_PERCENTAGE_LARGE_IMPROVEMENT &&
		timeImprovement < MIN_TIME_LARGE_IMPROVEMENT
	) return { success: false };

	return { 
		success: true,
		data: { percentageFaster }
	};
}

export const isSolvedWithTimeRecordImprovement = (
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
	{ personalBest, currentCounts, averageTimes }: {
		personalBest: PersonalBestGameEndStats,
		currentCounts: Pick<GameEndStats['currentCounts'], 'count'>,
		averageTimes: Pick<GameEndStats['averageTimes'], 'average'>
	}
): RecapMessageConditionResult<{
	timeSlower: number,
	percentageSlower: number,
	byPercentage: boolean, byTime: boolean
}> => {
	const count = currentCounts.count;
	// if less than 4 played, "almostTimeRecord" is not relevant enough
	if (count < 4) return { success: false };
	
	// can not be "almost" timeRecord if it is the best time
	if (personalBest.isTimeRecord()) return { success: false };

	const timeElapsed = personalBest.current.timeElapsed;
	const average = averageTimes.average;
	// if the time is slower than average, "almostTimeRecord" is too positive
	if (timeElapsed > average) return { success: false };

	const timeDifference = personalBest.getTimeImprovement(); // is negative, because slower
	const percentageDifference = personalBest.getPercentageSlowerThanBest();
	if (timeDifference == null || timeDifference >= 0 || percentageDifference == null) return { success: false };
	
	const timeSlower = Math.abs(timeDifference);
	
	// TODO: refine these conditions
	let successByPercentage = false;
	let successByTime = false;

	// if percentage slower is 5% or less, success (except if time difference is large)
	if (percentageDifference < 0.05 && timeSlower < 6000) {
		successByPercentage = true;
	}
	// if time slower is 0.8s or less, success (except if percentage difference is way too large)
	if (timeSlower < 800 && percentageDifference < 0.4) {
		successByTime = true;
	}

	if (successByPercentage || successByTime) {
		return {
			success: true,
			data: {
				timeSlower,
				percentageSlower: percentageDifference,

				byPercentage: successByPercentage,
				byTime: successByTime
			}
		};
	} else {
		return { success: false };
	}
}