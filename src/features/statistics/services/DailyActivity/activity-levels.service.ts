import { MINUTE } from "@/utils/time.utils.js";
import type { WithScore, WithLevel, ActivityLevel, DetermineLevelFn, ActivitySummary } from "./types.js";
import { getExtent, quantile } from "@/utils/data-analysis.utils.js";

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
	} else if (scoredMap.size <= 12) {
		return determineActivityLevelFewDays(scoredMap);
	} else {
		return determineActivityLevelManyDays(scoredMap);
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

const determineActivityLevelFewDays = (
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

function determineActivityLevelManyDays(
	summaryMap: Map<string, WithScore<ActivitySummary>>
): DetermineLevelFn {
	// Sort the summaries by score (lowest > highest)
	const sortedSummaries = Array
		.from(summaryMap.values())
		.sort((a, b) => a.score - b.score);
	const sortedScores = sortedSummaries.map(summary => summary.score);

	// The lowest 35% of scores are level 1, or all scores with a score lower than 20 (if that includes more items)
	const q35 = quantile(sortedScores, 0.35);
	const maxScoreRankOne = q35 > 20 ? q35 : 20;
	
	const isRankOne = (summary: WithScore<ActivitySummary>) => {
		return summary.score <= maxScoreRankOne;
	}
	
	const q90 = quantile(sortedScores, 0.9);
	// The highest 10% of scores are level 5 (uses q90)
	const isRankFive = (summary: WithScore<ActivitySummary>) => {
		return summary.score >= q90;
	}

	// spread rest between levels 2, 3, and 4
	const indexStart = sortedScores.findIndex(s => s > maxScoreRankOne);
	const indexEnd = sortedScores.findIndex(s => s >= q90);
	const range = indexEnd - indexStart;
	const perLevel = range / 3;
	
	const indexLevelTwo = indexStart + Math.floor(perLevel);
	const indexLevelThree = indexLevelTwo + Math.floor(perLevel);
	const getLevelMiddle = (summary: WithScore<ActivitySummary>, idx: number) => {
		if (idx <= indexLevelTwo) return 2;
		else if (idx <= indexLevelThree) return 3;
		else return 4;
	}

	return (summary) => {
		const sortedIndex = sortedSummaries.findIndex(s => s.localDateStr === summary.localDateStr);
		if (sortedIndex === -1) {
			throw new Error("Summary not found in sorted summaries");
		}
		if (isRankOne(summary)) return 1;
		else if (isRankFive(summary)) return 5;
		else return getLevelMiddle(summary, sortedIndex);		
	};
}