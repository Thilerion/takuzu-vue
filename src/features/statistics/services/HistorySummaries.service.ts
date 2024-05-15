import type { PuzzleConfigKey } from "@/lib/types.js";
import type { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";

export type PuzzleConfigSummary = {
	count: number;
	time: number;
}
export type PuzzleConfigSummaries = Map<PuzzleConfigKey, PuzzleConfigSummary>;

/**
 * Aggregates statistics for each puzzle configuration from a list of data entries.
 * @param items An array of statistic data entries to be summarized.
 * @returns A Map where the key is the puzzle configuration key and the value is the summary of count and total time.
 */
export const summarizeByPuzzleConfig = (items: StatsDbExtendedStatisticDataEntry[]): PuzzleConfigSummaries => {
	const result = new Map<PuzzleConfigKey, PuzzleConfigSummary>();
	for (const item of items) {
		const key = item.puzzleConfigKey;
		const existingSummary = result.get(key) || { count: 0, time: 0 };
		result.set(key, {
			count: existingSummary.count + 1,
			time: existingSummary.time + item.timeElapsed
		});
	}
	return result;
}

/**
 * Determines the puzzle configuration that was played the most.
 * If there's a tie in the count, it selects the configuration with the greatest cumulative playtime.
 * @param summaries A Map of puzzle configuration summaries.
 * @returns The key of the most played puzzle configuration.
 */
export const getMostPlayedPuzzleConfig = (summaries: PuzzleConfigSummaries): PuzzleConfigKey | null => {
	let maxCount = 0;
	let maxTime = 0;
	let mostPlayedConfig: PuzzleConfigKey | null = null;

	if (summaries.size === 0) return null;

	for (const [key, { count, time }] of summaries.entries()) {
		if (count > maxCount || (count === maxCount && time > maxTime)) {
			maxCount = count;
			maxTime = time;
			mostPlayedConfig = (key as PuzzleConfigKey);
		}
	}

	return mostPlayedConfig;
}