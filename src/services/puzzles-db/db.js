import { getRandomItem } from '@/utils/array.utils.js';
import Dexie from 'dexie';

const puzzleDb = new Dexie('PuzzleDB');
puzzleDb.version(1).stores({
	puzzles: "boardStr,solutionStr,[width+height],difficulty,[width+height+difficulty]"
});
puzzleDb.open();

class GeneratedPuzzle {
	constructor({ boardStr, solutionStr, difficulty, width, height }) {
		this.boardStr = boardStr;
		this.solutionStr = solutionStr;

		this.difficulty = difficulty;
		this.width = width;
		this.height = height;
	}
}

puzzleDb.puzzles.mapToClass(GeneratedPuzzle);

function addPuzzles(puzzles = []) {
	if (!puzzles.length) return;

	const genPuzzles = puzzles.map(data => {
		return new GeneratedPuzzle(data);
	})

	return puzzleDb.puzzles
		.bulkAdd(genPuzzles)
		.then(() => {
			console.log('Puzzles saved succesfully.');
		}).catch(err => {
			console.warn('Puzzles could not be saved to database.');
			console.error(err);
			throw err;
		});
}

function addPuzzle(puzzle) {
	return puzzleDb.puzzles.add(new GeneratedPuzzle(puzzle));
}

async function getPuzzle({ width, height, difficulty }) {
	return await puzzleDb.transaction('rw', puzzleDb.puzzles, async () => {
		const amount = await puzzleDb.puzzles.where({ width, height, difficulty }).count();
		if (amount === 0) {
			return null;
		}

		const matchingPuzzles = await puzzleDb.puzzles.where({ width, height, difficulty }).toArray();
		const puzzle = matchingPuzzles.length > 1 ? getRandomItem(matchingPuzzles) : matchingPuzzles[0];

		await puzzleDb.puzzles.delete(puzzle.boardStr);

		return puzzle;
	})
}

function clearPuzzleDb() {
	return puzzleDb.puzzles.clear();
}

export const puzzleTable = puzzleDb.puzzles;
export { puzzleDb, addPuzzles, addPuzzle, getPuzzle, clearPuzzleDb };