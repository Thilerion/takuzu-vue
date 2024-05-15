import type { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";
import { getExtent } from "@/utils/data-analysis.utils.js";
import { startOfDay } from "date-fns";

export type ActivitySummary = {
	date: Date;
	localDateStr: string;
	puzzlesPlayed: number;
	totalCells: number;
	totalTime: number; // in minutes
	puzzleTimes: number[]; // individual puzzle times in minutes
	score: number;
};

export function createDailyActivitySummaries(itemsRecentFirst: StatsDbExtendedStatisticDataEntry[]) {
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
				score: 0,
			});
		}

		const daySummary = result.get(localDateStr)!;
		daySummary.puzzlesPlayed += 1;
		daySummary.totalCells += item.numCells;
		daySummary.totalTime += item.timeElapsed;
		daySummary.puzzleTimes.push(item.timeElapsed);
	});

	// iterate over result keys and values
	for (const [key, daySummary] of result) {
		const score = calculateDayActivityScore(daySummary);
		daySummary.score = score;
		result.set(key, daySummary);
	}

	return result;
}

function calculateDayActivityScore(summary: Omit<ActivitySummary, 'score'>): number {
	let score = 0;

	// If no puzzles played, return 0
	if (summary.puzzlesPlayed === 0) {
		return 0;
	}

	// Base daily score: 3 points per puzzle, 1 point per 100 cells, 1 point per minute (capped to 5 points per puzzle)
	score += summary.puzzlesPlayed * 3;
	score += Math.floor(summary.totalCells / 100);
	for (const timeMs of summary.puzzleTimes) {
		const minutesUp = Math.ceil(timeMs / 60_000);
		score += Math.min(5, minutesUp);
	}

	// Additional bonus points: each 10 minutes of total time give 1 extra point
	const tenMinutes = Math.floor(summary.totalTime / 10_000);
	score += tenMinutes;
	// Additional bonus point: each 5 puzzles give 3 extra points
	const fivePuzzles = Math.floor(summary.puzzlesPlayed / 5);
	score += fivePuzzles * 3;
	// If there has been any activity whatsoever, ensure the score is at least 1
	return Math.max(1, score);
}

const normalizeScores = (scores: number[]) => {
	const [minScore, maxScore] = getExtent(scores);
	const scoreRange = maxScore - minScore;
	return scores.map(score => (score - minScore) / scoreRange);
}

const assignRanks = (normalizedScores: number[], numRanks = 5) => {
	const rankBoundaries = new Array(numRanks).fill(0).map((_, i) => i / numRanks);
	return normalizedScores.map(score => {
		for (let rank = numRanks - 1; rank >= 0; rank--) {
			if (score >= rankBoundaries[rank]) {
				return rank;
			}
		}
		return 0;
	});
}

/**
 * Categorizes daily activity summaries based on their scores, to a rank of between 0 and 4.
 * The rank can then later in the UI be used in the heatmap to color the cells, with rank 4 being the highest (and darkest).
 * 
 * @param summaryMap - Map of DateStr > ActivitySummary, with each ActivitySummary containing a score and the date string itself
 */
export function rankDailyActivitySummaries(
	summaryMap: Map<string, ActivitySummary>,
	numRanks?: number
) {
	const summaries = Array.from(summaryMap.values());
	const allScores = summaries.map(summary => summary.score);
	
	// First, normalize the scores to a range of 0 to 1
	const normalizedScores = normalizeScores(allScores);

	// Assign ranks based on the normalized scores and the specified number of ranks
	const ranks = assignRanks(normalizedScores, numRanks);

	// Create a new map with ranked summaries
	const rankedSummaryMap = new Map<string, number>();
	for (let i = 0; i < summaries.length; i++) {
		const localDateStr = summaries[i].localDateStr;
		const rank = ranks[i];
		rankedSummaryMap.set(localDateStr, rank);
	}

	return rankedSummaryMap;
}