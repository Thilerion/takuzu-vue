import { groupBy } from "@/utils/array.ts.utils";
import { minMaxSum, getAverage, getMedian } from '@/utils/data-analysis.utils';
import type { StatsDbExtendedStatisticDataEntry } from "../db/stats-db/models.js";

interface MinMaxSumResult {
	min: number,
	max: number,
	sum: number
}
export interface Summary extends MinMaxSumResult {
	count: number,
	average: number,
	median: number,
}

function groupItemsByPuzzleConfig<T extends StatsDbExtendedStatisticDataEntry>(items: T[] = []) {
	const groupedObj = groupBy(items, 'puzzleConfigKey');
	return Object.entries(groupedObj).map(([key, items]) => {
		const { width, height, dimensions, difficulty, numCells } = items[0];
		const groupData = { width, height, dimensions, difficulty, numCells, puzzleConfigKey: key };
		return { type: 'puzzleConfig', key, items, groupData };
	})
}

function groupItemsByDimensions<T extends StatsDbExtendedStatisticDataEntry>(items: T[] = []) {
	const groupedObj = groupBy(items, 'dimensions');
	return Object.entries(groupedObj).map(([key, items]) => {
		const { width, height, dimensions, numCells } = items[0];
		const groupData = { width, height, dimensions, numCells, puzzleConfigKey: dimensions };
		return { type: 'dimensions', key, items, groupData };
	})
}

function summarizeGroup(times: number[] = []) {
	const summary = {
		count: times.length,
	} as Summary;
	Object.assign(summary, minMaxSum(times));
	summary.average = getAverage(times, summary);
	summary.median = getMedian(times, { sorted: false }, summary);
	return summary;
}

export function getMostPlayedPuzzleSizes<T extends StatsDbExtendedStatisticDataEntry>(items: T[] = []) {
	const groupedArr = groupItemsByDimensions(items).map(g => {
		const { items } = g;
		const times = items.map(i => i.timeElapsed);
		return {
			...g,
			times,
			summary: summarizeGroup(times)
		};
	})

	const withFavScores = groupedArr.map(group => {
		const summary = withFavScore(group.summary);
		return { ...group, summary };
	})

	const byPlaytime = [...withFavScores].sort((a, z) => z.summary.sum - a.summary.sum);
	const byPlayed = [...withFavScores].sort((a, z) => z.summary.count - a.summary.count);
	const byFavorite = [...withFavScores].sort((a, z) => z.summary.favScore - a.summary.favScore);

	return {
		groupedData: withFavScores,
		byPlaytime,
		byPlayed,
		byFavorite
	}
}

export function getMostPlayedPuzzleConfigs<T extends StatsDbExtendedStatisticDataEntry>(items: T[] = []) {
	const groupedArr = groupItemsByPuzzleConfig(items).map(g => {
		const { items } = g;
		const times = items.map(i => i.timeElapsed);
		return {
			...g,
			times,
			summary: summarizeGroup(times)
		};
	})

	const withFavScores = groupedArr.map(group => {
		const summary = withFavScore(group.summary);
		return { ...group, summary };
	})

	const byPlaytime = [...withFavScores].sort((a, z) => z.summary.sum - a.summary.sum);
	const byPlayed = [...withFavScores].sort((a, z) => z.summary.count - a.summary.count);
	const byFavorite = [...withFavScores].sort((a, z) => z.summary.favScore - a.summary.favScore);

	return {
		groupedData: withFavScores,
		byPlaytime,
		byPlayed,
		byFavorite
	}
}

function withFavScore(summary: Summary) {
	const { sum, count } = summary;
	const favScore = sum + (count * 15000);
	return { ...summary, favScore };
}