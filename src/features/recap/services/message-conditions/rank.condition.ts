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

/** A condition which is useful for players with many solved puzzles, indicating whether the time is in the users top 5. */
export const isTop5FastestTime = (
	stats: Pick<GameEndStats, 'getNumSolvedWithConfig' | 'puzzleTimes' | 'getTimeElapsed'>
): RecapMessageConditionResult<{ rank: number }> => {
	if (stats.getNumSolvedWithConfig() < 100) return { success: false };

	const time = stats.getTimeElapsed();
	const allTimes = stats.puzzleTimes.sortedTimes;

	const index = allTimes.indexOf(time);
	if (index < 0) return { success: false };

	const rank = index + 1;
	// in top 5, but not as personal best (rank 0)
	if (rank <= 5 && rank > 0) return { success: true, data: { rank } };

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