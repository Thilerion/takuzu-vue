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
		.then(result => {
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
	const puzzle = await puzzleDb.transaction('rw', puzzleDb.puzzles, async () => {
		const result = await puzzleDb.puzzles.where({ width, height, difficulty }).first();

		if (result) {
			const deleteCount = await puzzleDb.puzzles.where('boardStr').equals(result.boardStr).delete();
			console.log('deleted!');
			console.log({ deleteCount });
		}
		return result;
	})
	return puzzle;
}

function clearPuzzleDb() {
	return puzzleDb.puzzles.clear();
}

export const puzzleTable = puzzleDb.puzzles;
export { puzzleDb, addPuzzles, addPuzzle, getPuzzle, clearPuzzleDb };