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
	console.log({ width, height, difficulty });
	debugger;
	const items = await puzzleHistoryDb.where('[width+height]').equals([width, height]).and(item => item.difficulty === difficulty).sortBy('timeElapsed');

	const bestTime = items[0].timeElapsed;
	const sum = items.reduce((acc, item) => acc + item.timeElapsed, 0);
	const avg = (sum / items.length) || 0;

	console.log({ bestTime, sum, avg });
	return { best: bestTime, avg };
}