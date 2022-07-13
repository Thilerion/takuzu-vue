import { groupBy } from "@/utils/array.utils";
import { minMaxSum, average, median } from '@/utils/data-analysis.utils';

function groupItemsByPuzzleConfig(items = []) {
	const groupedObj = groupBy(items, 'puzzleConfigKey');
	return Object.entries(groupedObj).map(([key, items]) => {
		const { width, height, dimensions, difficulty, numCells } = items[0];
		const groupData = { width, height, dimensions, difficulty, numCells, puzzleConfigKey: key };
		return { type: 'puzzleConfig', key, items, groupData };
	})
}

function groupItemsByDimensions(items = []) {
	const groupedObj = groupBy(items, 'dimensions');
	return Object.entries(groupedObj).map(([key, items]) => {
		const { width, height, dimensions, numCells } = items[0];
		const groupData = { width, height, dimensions, numCells, puzzleConfigKey: dimensions };
		return { type: 'dimensions', key, items, groupData };
	})
}

function summarizeGroup(times = []) {
	const summary = {
		count: times.length,
	};
	Object.assign(summary, minMaxSum(times));
	summary.average = average(times, summary);
	summary.median = median(times, { sorted: false }, summary);
	return summary;
}

export function getMostPlayedPuzzleSizes(items = []) {
	const groupedArr = groupItemsByDimensions(items).map(g => {
		const { items } = g;
		const times = items.map(i => i.timeElapsed);
		return {
			...g,
			times,
			summary: summarizeGroup(times)
		};
	})

	addFavoriteScores(groupedArr);

	const byPlaytime = [...groupedArr].sort((a, z) => z.summary.sum - a.summary.sum);
	const byPlayed = [...groupedArr].sort((a, z) => z.summary.count - a.summary.count);
	const byFavorite = [...groupedArr].sort((a, z) => z.summary.favScore - a.summary.favScore);

	return {
		groupedData: groupedArr,
		byPlaytime,
		byPlayed,
		byFavorite
	}
}

export function getMostPlayedPuzzleConfigs(items = []) {
	const groupedArr = groupItemsByPuzzleConfig(items).map(g => {
		const { items } = g;
		const times = items.map(i => i.timeElapsed);
		return {
			...g,
			times,
			summary: summarizeGroup(times)
		};
	})

	addFavoriteScores(groupedArr);

	const byPlaytime = [...groupedArr].sort((a, z) => z.summary.sum - a.summary.sum);
	const byPlayed = [...groupedArr].sort((a, z) => z.summary.count - a.summary.count);
	const byFavorite = [...groupedArr].sort((a, z) => z.summary.favScore - a.summary.favScore);

	return {
		groupedData: groupedArr,
		byPlaytime,
		byPlayed,
		byFavorite
	}
}

function addFavoriteScores(groups) {
	for (const group of groups) {
		const { summary } = group;
		const { sum, count } = summary;

		const favScore = sum + (count * 15000);
		
		group.summary.favScore = favScore;
	}
}
