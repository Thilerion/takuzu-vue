import { puzzleHistoryTable } from "./db";
import { PuzzleStatisticData } from "./models";

export const getPuzzlesSolved = () => puzzleHistoryTable.count();

export const getAllHistoryItems = async () => {
	let items = [];
	await puzzleHistoryTable.each(item => {
		const statModel = new PuzzleStatisticData(item);
		items.push(statModel);
	})
	return items;
}

export const summarizeStatGroup = (items = []) => {
	if (!items.length) {
		return {
			totalPlayed: 0,
			adjustedTime: 0,
			adjustedAverage: 0,
			totalTime: 0,
			best: 0,
			worst: 0,
			average: 0
		};
	}

	let totalPlayed = items.length;
	
	let adjustedTime = 0;
	let totalTime = 0;

	let best = Infinity;
	let worst = -1;

	for (let item of items) {
		const { timeElapsedAdjusted, timeElapsed } = item;
		adjustedTime += timeElapsedAdjusted;
		totalTime += timeElapsed;

		best = Math.min(timeElapsed, best);
		worst = Math.max(timeElapsed, worst);
	}

	const average = totalTime / totalPlayed;
	const adjustedAverage = adjustedTime / totalPlayed;
	return {
		totalPlayed,
		adjustedTime,
		adjustedAverage,
		totalTime,
		best,
		worst,
		average
	}
}