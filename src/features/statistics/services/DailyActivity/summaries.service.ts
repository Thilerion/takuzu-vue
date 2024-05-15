import type { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";
import { startOfDay } from "date-fns";
import type { ActivitySummary } from "./types.js";

/**
 * Creates daily activity summaries from a list of statistics data entries.
 * 
 * This function groups the data entries by date and calculates the total number of puzzles played, 
 * total cells filled, total time spent, and individual puzzle times for each date. 
 * It also calculates a score for each date using the provided `scoreFromSummary` function.
 * 
 * @param itemsRecentFirst - An array of statistics data entries, sorted in descending order by date.
 * @param scoreFromSummary - Allow for overriding the default score calculation function.
 * 
 * @returns A Map where the keys are date strings and the values are the corresponding activity summaries.
 */
export function createDailyActivitySummaries(
	itemsRecentFirst: StatsDbExtendedStatisticDataEntry[],
): Map<string, ActivitySummary> {
	const result = new Map<string, ActivitySummary>();

	itemsRecentFirst.forEach(item => {
		const localDateStr = item.localDateStr;
		if (!result.has(localDateStr)) {
			result.set(localDateStr, {
				date: startOfDay(new Date(item.date)),
				localDateStr,
				puzzlesPlayed: 0,
				totalCells: 0,
				totalTime: 0,
				puzzleTimes: [],
			});
		}

		const daySummary = result.get(localDateStr)!;
		daySummary.puzzlesPlayed += 1;
		daySummary.totalCells += item.numCells;
		daySummary.totalTime += item.timeElapsed;
		daySummary.puzzleTimes.push(item.timeElapsed);
	});

	return result;
}