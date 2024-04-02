import type { BasicPuzzleConfig } from "@/lib/types.js";
import type { GameEndStats } from "../GameEndStats.js";
import { isMultipleOf } from "../helpers.js";
import type { RecapMessageConditionResult } from "../types.js";

export const hasSolvedAmountInTotal = (
	stats: Pick<GameEndStats, 'totals'>
): RecapMessageConditionResult<{
	totalSolved: number
}> => {
	const totalSolved = stats.totals.amount;
	let success = false;
	if (totalSolved <= 50 && isMultipleOf(totalSolved, 5)) {
		// 5, 10, ..., 50
		success = true;
	} else if (totalSolved > 50 && totalSolved <= 150 && isMultipleOf(totalSolved, 25)) {
		// 75, 100, 125, 150
		success = true;
	} else if (totalSolved > 150 && isMultipleOf(totalSolved, 50)) {
		// 200, 250, 300, ...
		success = true;
	}
	if (!success) return { success: false };
	return { success: true, data: { totalSolved } };
}

export const hasSolvedAmountToday = (
	stats: Pick<GameEndStats, 'totals'>
): RecapMessageConditionResult<{
	totalSolvedToday: number
}> => {
	const totalSolvedToday = stats.totals.today;
	if (isMultipleOf(totalSolvedToday, 5) && totalSolvedToday >= 5) return { success: true, data: { totalSolvedToday } };
	return { success: false };
}

export const hasSolvedAmountWithConfigInTotal = (
	stats: Pick<GameEndStats, 'currentCounts' | 'getPuzzleConfig'>
): RecapMessageConditionResult<BasicPuzzleConfig & {
	count: number
}> => {
	const count = stats.currentCounts.count;
	let success = false;
	if (count >= 10 && count <= 50 && isMultipleOf(count, 10)) {
		// 10, 20, ..., 50
		success = true;
	} else if (count > 50 && count <= 250 && isMultipleOf(count, 25)) {
		// 75, 100, 125, ..., 250
		success = true;
	} else if (count > 250 && isMultipleOf(count, 50)) {
		// 300, 350, 400, ...
		success = true;
	}
	if (!success) return { success: false };
	const { width, height, difficulty } = stats.getPuzzleConfig();
	return { success: true, data: { count, width, height, difficulty } };
}

export const hasSolvedAmountWithConfigToday = (
	stats: Pick<GameEndStats, 'currentCounts' | 'historyEntry'>
): RecapMessageConditionResult<BasicPuzzleConfig & {
	count: number
}> => {
	const count = stats.currentCounts.today;

	if (isMultipleOf(count, 5) && count >= 5) {
		// 5, 10, 15,...
		const { width, height, difficulty } = stats.historyEntry;
		return {
			success: true,
			data: {
				count, width, height, difficulty
			}
		}
	}
	return { success: false };
}