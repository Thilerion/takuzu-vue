import { puzzleHistoryDb } from './db';
import { PuzzleData } from './PuzzleData';

puzzleHistoryDb.mapToClass(PuzzleData);

// TODO: persistent storage (https://web.dev/persistent-storage/) to make sure data doesn't get deleted
// even better would be to sync data somewhere (firebase?) but that is something for the future

export const statsQueries = {
	numSolved() {
		return puzzleHistoryDb.count();
	},
	numSolvedWithDifficulty(value) {
		return puzzleHistoryDb.where('difficulty').equals(value).count();
	},
	numSolvedWithDimensions(width, height) {
		return puzzleHistoryDb.where('[width+height]').equals([width, height]).count();
	},
	getAll() {
		return puzzleHistoryDb.toArray();
	}
}

export const getGameEndStats = async ({ width, height, difficulty }) => {

	let items;

	try {
		items = await puzzleHistoryDb.where('[width+height+difficulty]').equals([width, height, difficulty]).sortBy('timeElapsed');
	} catch (e) {
		console.warn('Could not retrieve puzzle history data for gameEnd stats.');
		console.warn(e);
	}

	if (!items || !items.length) {
		return { count: 0 };
	}

	const result = {
		best: items[0].timeElapsed,
		timeSum: items.reduce((acc, item) => acc + item.timeElapsed, 0),
		count: items.length,
	}

	return {
		...result,
		average: (result.timeSum / result.count) || 0
	}
}