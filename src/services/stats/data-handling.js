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