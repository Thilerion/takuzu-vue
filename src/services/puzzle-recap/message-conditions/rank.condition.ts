import type { GameEndStats } from "../GameEndStats.js";
import type { RecapMessageConditionResult } from "../types.js";

export const isInTop5PercentOfTimes = (
	stats: Pick<GameEndStats, 'getNumSolvedWithConfig' | 'puzzleTimes' | 'getTimeElapsed'>
): RecapMessageConditionResult<{ rank: number }> => {
	// Does not apply if amount solved of this puzzle type/config is less than 20.
	if (stats.getNumSolvedWithConfig() < 20) return { success: false };

	// TODO: should additional checks be added to ensure the time is not a time record, and to ensure the time is faster than average?

	const time = stats.getTimeElapsed();
	const allTimes = stats.puzzleTimes.sortedTimes;

	const rank = calculatePercentileRank(allTimes, time);
	if (rank == null) {
		return { success: false };
	} else if (rank <= 5) {
		return { success: true, data: { rank: rank } }
	}

	return { success: false };
}

function calculatePercentileRank(items: number[], time: number): number | null {
	// find the index and lastIndex of the time in the sorted list
	const index = items.indexOf(time);
	const lastIndex = items.lastIndexOf(time);

	if (lastIndex < 0 || index < 0) {
		return null;
	}

	const frequency = lastIndex - index + 1;
	const cumFrequency = lastIndex + 1;
	const count = items.length;

	return (cumFrequency - (frequency / 2)) / count * 100;
}