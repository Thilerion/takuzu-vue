import type { WithScore, ActivitySummary } from "./types.js";

export function assignActivityScores(
	summaryMap: Map<string, ActivitySummary>,
	pointsConfig?: SummaryPointsConfig
): Map<string, WithScore<ActivitySummary>> {
	const result = new Map<
		string,
		WithScore<ActivitySummary>
	>();

	for (const [dateStr, daySummary] of summaryMap) {
		const score = activityScoreFromSummary(daySummary, pointsConfig);
		result.set(dateStr, { ...daySummary, score });
	}

	return result;
}

export type SummaryPointsConfig = {
	perPuzzle: number;
	per100Cells: number;
	perMinute: {
		score: number;
		capPerPuzzle: number | null;
	},

	bonusPoints: {
		per10Minutes?: number;
		per5Puzzles?: number;
	},
}
const defaultSummaryPointsConfig: SummaryPointsConfig = {
	perPuzzle: 3,
	per100Cells: 1,
	perMinute: {
		score: 1,
		capPerPuzzle: 5,
	},
	bonusPoints: {
		per10Minutes: 1,
		per5Puzzles: 3,
	},
};
function activityScoreFromSummary(
	summary: ActivitySummary,
	pointsConfig: SummaryPointsConfig = defaultSummaryPointsConfig
): number {
	let score = 0;

	// If no puzzles played, return 0
	if (summary.puzzlesPlayed === 0) {
		return 0;
	}

	// Base daily score: 3 points per puzzle, 1 point per 100 cells, 1 point per minute (capped to 5 points per puzzle)
	score += summary.puzzlesPlayed * pointsConfig.perPuzzle;
	score += (Math.floor(summary.totalCells / 100) * pointsConfig.per100Cells);

	const minuteScoreCapPerPuzzle = pointsConfig.perMinute.capPerPuzzle ?? Infinity;
	for (const timeMs of summary.puzzleTimes) {
		const minutesUp = Math.ceil(timeMs / 60_000);
		const cappedMinutes = Math.min(minutesUp, minuteScoreCapPerPuzzle);
		score += (cappedMinutes * pointsConfig.perMinute.score);
	}

	const { per10Minutes: bonusPointsPer10Minutes, per5Puzzles: bonusPer5Puzzles } = pointsConfig.bonusPoints;
	
	if (bonusPointsPer10Minutes) {
		// Additional bonus points: each 10 minutes of total time give 1 extra point
		const tenMinutes = Math.floor(summary.totalTime / 10_000);
		score += (tenMinutes * bonusPointsPer10Minutes);
	}
	if (bonusPer5Puzzles) {
		// Additional bonus point: each 5 puzzles give 3 extra points
		const fivePuzzles = Math.floor(summary.puzzlesPlayed / 5);
		score += fivePuzzles * bonusPer5Puzzles;
	}
	
	return Math.max(1, score);
}