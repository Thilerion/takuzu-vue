import { groupBy } from "@/utils/array.utils";
import * as dataAnalysis from '@/utils/data-analysis.utils';

function groupItemsByPuzzleConfig(items = []) {
	const groupedObj = groupBy(items, 'puzzleConfigKey');
	return Object.entries(groupedObj).map(([key, items]) => {
		const { width, height, dimensions, difficulty, numCells } = items[0];
		const groupData = { width, height, dimensions, difficulty, numCells, puzzleConfigKey: key };
		return { type: 'puzzleConfig', key, items, groupData };
	})
}

function summarizeGroup(times = []) {
	const summary = {
		count: times.length,
	};
	Object.assign(summary, dataAnalysis.minMaxSum(times));
	summary.average = dataAnalysis.average(times, summary);
	summary.median = dataAnalysis.median(times, { sorted: false }, summary);
	return summary;
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
		const { summary, groupData } = group;
		const { numCells } = groupData;
		const { sum, count } = summary;

		const favScore = ((count * 10000) + sum) / Math.pow(numCells, 1 / 32);
		console.log({ favScore });
		
		group.summary.favScore = favScore;
	}
}
