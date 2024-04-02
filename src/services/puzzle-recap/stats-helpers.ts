import type { BasicPuzzleConfig, BoardShape, DifficultyKey } from "@/lib/types";
import { startOfDay } from "date-fns";
import { statsDb } from "../db/stats-db/init";
import type { StatsDbHistoryEntryWithId, StatsDbHistoryEntry } from "../db/stats-db/models";
import type { IPuzzleConfigBestAndAverage, IPuzzleConfigCounts, IHistoryTotals, IUniquePuzzleConfigurationPlayed, IPuzzleReplayStatistics } from "./GameEndStats";

export function getBestAndAverages(
	historyEntry: StatsDbHistoryEntryWithId | StatsDbHistoryEntry,
	items: StatsDbHistoryEntryWithId[],
	previousItems: StatsDbHistoryEntryWithId[]
): IPuzzleConfigBestAndAverage {
	if (items.length === 0) {
		return {
			best: 0,
			average: 0,
			previousBest: null,
			previousAverage: null,
			
			isTimeRecord: false,
		}
	}

	const bestTimeItem = items[0];
	const previousBestTimeItem = previousItems[0] ?? null;

	const timeSum = items.reduce((acc, val) => acc + val.timeElapsed, 0);
	const previousTimeSum = previousItems.reduce((acc, val) => acc + val.timeElapsed, 0);

	const average = timeSum / items.length;
	const previousAverage = previousItems.length > 0 ? previousTimeSum / previousItems.length : null;

	return {
		best: bestTimeItem.timeElapsed,
		previousBest: previousBestTimeItem?.timeElapsed ?? null,
		average,
		previousAverage,
		
		isTimeRecord: historyEntry.id === bestTimeItem.id,
	}
}

export async function getPreviousItemsWithPuzzleConfig(config: BasicPuzzleConfig, id: number | null): Promise<{ items: StatsDbHistoryEntryWithId[], previousItems: StatsDbHistoryEntryWithId[] }> {
	const { width, height, difficulty } = config;
	const items = await statsDb.puzzleHistory
			.where('[width+height+difficulty]')
			.equals([width, height, difficulty])
		.sortBy('timeElapsed');
	const previousItems = id == null ? items : items.filter(val => val.id !== id);
	return { items, previousItems };
}

export function countPreviousItemsWithDimensions({ width, height }: BoardShape): Promise<number> {
	return statsDb.puzzleHistory.where({ width, height }).count();
}
export function countPreviousItemsWithDifficulty(difficulty: DifficultyKey): Promise<number> {
	return statsDb.puzzleHistory.where({ difficulty }).count();
}
export async function getPuzzleCurrentCounts(
	entry: StatsDbHistoryEntry,
	allItems: StatsDbHistoryEntryWithId[],
	prevItems: StatsDbHistoryEntryWithId[]
): Promise<IPuzzleConfigCounts> {
	const withSize = await countPreviousItemsWithDimensions(entry);
	const withDifficulty = await countPreviousItemsWithDifficulty(entry.difficulty);

	const startOfToday = startOfDay(Date.now());
	const startOfTodayTimestamp = startOfToday.getTime();
	const countToday = allItems.reduce<number>((acc, val) => {
		if (val.timestamp >= startOfTodayTimestamp) return acc + 1;
		return acc;
	}, 0);

	return {
		today: countToday,
		count: allItems.length,
		previous: prevItems.length,

		withSize,
		withDifficulty,
	}
}

export async function getHistoryTotals(): Promise<IHistoryTotals> {
	const startOfToday = startOfDay(new Date());
	const startOfTodayTimestamp = startOfToday.getTime();

	const [
		amount, today
	] = await Promise.all([
		statsDb.getTotalSolved(),
		statsDb.getTotalSolvedAfterDate(startOfTodayTimestamp),
	])
	
	return {
		amount, today
	}
}

export async function getUniquePlayedPuzzleConfigs(): Promise<IUniquePuzzleConfigurationPlayed> {
	const rawUniqueSizesPlayed = await statsDb.getUniquePlayedSizes();
	const rawUniqueDifficultiesPlayed = await statsDb.getUniquePlayedDifficulties();
	const rawUniquePuzzleConfigsPlayed = await statsDb.getUniquePlayedPuzzleConfigs();

	const uniqueSizesPlayed = rawUniqueSizesPlayed.map((shape) => ({
		width: shape.width,
		height: shape.height,
		cells: shape.width * shape.height
	})).sort((a, b) => {
		return a.cells - b.cells;
	});
	const uniqueDifficultiesPlayed = [...rawUniqueDifficultiesPlayed].sort((a, b) => {
		return a - b;
	})
	const uniquePuzzleConfigsPlayed = rawUniquePuzzleConfigsPlayed.map((shape) => ({
		width: shape.width,
		height: shape.height,
		cells: shape.width * shape.height,
		difficulty: shape.difficulty
	})).sort((a, b) => {
		const byDiff = a.difficulty - b.difficulty;
		if (byDiff !== 0) return byDiff;
		return a.cells - b.cells;
	});

	return {
		sizes: uniqueSizesPlayed,
		difficulties: uniqueDifficultiesPlayed,
		configs: uniquePuzzleConfigsPlayed,
	}
}

export async function getPuzzleReplayStats(entry: StatsDbHistoryEntryWithId | StatsDbHistoryEntry): Promise<IPuzzleReplayStatistics> {
	const { initialBoard, id } = entry;
	if (id == null) {
		return {
			isReplay: false,
			previousPlays: []
		}
	}
	const previousPlays = await statsDb.puzzleHistory
		.where({ initialBoard })
		.filter(val => val.id !== id).toArray();
	const isReplay = previousPlays.length > 0;
	return {
		isReplay,
		previousPlays
	}
}