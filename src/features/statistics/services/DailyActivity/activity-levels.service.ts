import { MINUTE } from "@/utils/time.utils.js";
import type { WithScore, WithLevel, ActivityLevel, DetermineLevelFn, ActivitySummary } from "./types.js";
import { getExtent } from "@/utils/data-analysis.utils.js";

export function assignActivityLevels(
	scoredMap: Map<string, WithScore<ActivitySummary>>,
): Map<string, WithLevel<WithScore<ActivitySummary>>> {
	const result = new Map<
		string,
		WithLevel<WithScore<ActivitySummary>>
	>();

	const getLevel = getDetermineLevelFn(scoredMap);
	for (const [dateStr, daySummary] of scoredMap) {
		const level = getLevel(daySummary);
		result.set(dateStr, { ...daySummary, level });
	}

	return result;
}

function getDetermineLevelFn(scoredMap: Map<string, WithScore<ActivitySummary>>): DetermineLevelFn {
	if (scoredMap.size === 1) {
		return determineActivityLevelSingleDay();
	} else {
		return legacyDetermineActivityLevel(scoredMap);
	}
}

/**
 * Determines the activity level of an item when it is the only day with activity.
 * 
 * If only 1 puzzle has been played (max time 3 minutes), it assigns level 1. Else,
 * if 5+ puzzles were played (and time > 10 minutes), assign level 5.
 * Else, it simply gives level 3.
 */
const determineActivityLevelSingleDay = (): DetermineLevelFn => (summary: ActivitySummary): ActivityLevel => {
	if (summary.puzzlesPlayed === 1 && summary.totalTime < MINUTE * 5) {
		return 1;
	} else if (summary.puzzlesPlayed >= 5 && summary.totalTime > MINUTE * 10) {
		return 5;
	} else {
		return 3;
	}
}

const legacyDetermineActivityLevel = (
	summaryMap: Map<string, WithScore<ActivitySummary>>
): DetermineLevelFn => {
	const summaries = Array.from(summaryMap.values());
	const allScores = summaries.map(summary => summary.score);
	// First, normalize the scores to a range of 0 to 1
	const normalizeScore = createNormalizeScore(allScores);

	// Assign ranks
	const numRanks = 5;
	const rankBoundaries = new Array(numRanks).fill(0).map((_, i) => i / numRanks);
	return (summary) => {
		const score = normalizeScore(summary.score);
		for (let rank = numRanks - 1; rank >= 0; rank--) {
			if (score >= rankBoundaries[rank]) {
				return (rank + 1) as ActivityLevel;
			}
		}
		return 0;
	};
}
/** Normalizes all scores in the array to be in range [0, 1]. */
function createNormalizeScore(scores: number[]) {
	const [minScore, maxScore] = getExtent(scores);
	const scoreRange = maxScore - minScore;
	return (score: number) => (score - minScore) / scoreRange;
}