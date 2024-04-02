import type { BasicPuzzleConfig, BoardShape, DifficultyKey } from "@/lib/types.js";
import type { GameEndStats } from "../GameEndStats.js";
import type { RecapMessageConditionResult } from "../types.js";

export const isFirstEverSolved = (
	stats: Pick<GameEndStats, 'totals'>
): RecapMessageConditionResult<{ totalSolved: number }> => {
	const totalSolved = stats.totals.amount;
	if (totalSolved !== 1) return { success: false };
	return {
		success: true,
		data: { totalSolved }
	}
}

export const isHardestEverSolved = (
	stats: Pick<GameEndStats, 'isCurrentPuzzleHardestEverPlayed' | 'isFirstSolvedWithPuzzleConfig'>
): RecapMessageConditionResult<null> => {
	// applies not only when the difficulty is the highest difficulty ever solved, but also when this difficulty has already been played, but now it's been played on a larger board
	if (!stats.isFirstSolvedWithPuzzleConfig()) {
		return { success: false };
	}
	const isHardestEver = stats.isCurrentPuzzleHardestEverPlayed();
	if (isHardestEver) {
		return { success: true, data: null };
	}
	return { success: false };
}

export const isFirstOfDifficultySolved = (
	stats: Pick<GameEndStats, 'isFirstSolvedWithDifficulty' | 'getPuzzleConfig'>
): RecapMessageConditionResult<{ difficulty: DifficultyKey }> => {
	if (!stats.isFirstSolvedWithDifficulty()) return { success: false };
	return {
		success: true,
		data: {
			difficulty: stats.getPuzzleConfig().difficulty
		}
	};
}

export const isFirstWithDimensionsSolved = (
	stats: Pick<GameEndStats, 'isFirstSolvedWithSize' | 'getPuzzleConfig'>
): RecapMessageConditionResult<BoardShape> => {
	if (!stats.isFirstSolvedWithSize()) return { success: false };
	const { width, height } = stats.getPuzzleConfig();
	return {
		success: true,
		data: { width, height }
	};
}

export const isFirstSolvedWithPuzzleConfig = (
	stats: Pick<GameEndStats, 'isFirstSolvedWithPuzzleConfig' | 'getPuzzleConfig'>
): RecapMessageConditionResult<BasicPuzzleConfig> => {
	if (!stats.isFirstSolvedWithPuzzleConfig()) return { success: false };
	const { width, height, difficulty } = stats.getPuzzleConfig();
	return {
		success: true,
		data: { width, height, difficulty }
	};
}