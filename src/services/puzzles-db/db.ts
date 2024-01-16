import type { BoardExportString, BoardShape, DifficultyKey } from "@/lib/types";
import { getRandomItem } from "@/utils/array.ts.utils";
import Dexie from "dexie";

export interface IPregenPuzzle extends BoardShape {
	boardStr: BoardExportString,
	solutionStr: BoardExportString,
	difficulty: DifficultyKey
}

export class GeneratedPuzzle implements IPregenPuzzle {
	boardStr: BoardExportString;
	solutionStr: BoardExportString;
	difficulty: DifficultyKey;
	width: number;
	height: number;
	populated?: boolean;
	constructor({
		boardStr, solutionStr,
		difficulty,
		width, height, populated
	}: IPregenPuzzle & { populated?: boolean }) {
		console.log({ boardStr, solutionStr });
		this.boardStr = boardStr;
		this.solutionStr = solutionStr;
		this.difficulty = difficulty;
		this.width = width;
		this.height = height;
		if (populated) {
			this.populated = populated;
		}
	}	
}

export class PregenPuzzlesDb extends Dexie {
	// Declare implicit table properties.
    // (just to inform Typescript. Instanciated by Dexie in stores() method)
	puzzles!: Dexie.Table<GeneratedPuzzle, BoardExportString>;

	constructor() {
		super("PuzzleDB");
		this.version(1).stores({
			puzzles: "boardStr,solutionStr,[width+height],difficulty,[width+height+difficulty]"
		})

		this.puzzles.mapToClass(GeneratedPuzzle);
	}

	addPuzzle(puzzle: IPregenPuzzle) {
		return addPuzzle(puzzle);
	}
	addPuzzles(puzzles: IPregenPuzzle[]) {
		return addPuzzles(puzzles);
	}
	putPuzzles(puzzles: IPregenPuzzle[]) {
		return this.puzzles.bulkPut(puzzles);
	}
	getPuzzle(data: GetPregenPuzzleProps) {
		return getPuzzle(data);
	}
	clearPuzzles() {
		return this.puzzles.clear();
	}
	countAllPuzzles() {
		return this.puzzles.count();
	}
	async populateWith(data: IPregenPuzzle[]) {
		const count = await this.countAllPuzzles();
		if (count > 0) {
			throw new Error('Cannot populate puzzles database when there are puzzles already set.');
		}
		const puzzles = data.map(val => {
			return { ...val, populated: true };
		})
		return this.putPuzzles(puzzles);
	}
}

export const puzzleDb = new PregenPuzzlesDb();

function addPuzzles(puzzles: IPregenPuzzle[]) {
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

function addPuzzle(puzzle: IPregenPuzzle) {
	return puzzleDb.puzzles.add(new GeneratedPuzzle(puzzle));
}

export interface GetPregenPuzzleProps {
	width: number,
	height: number,
	difficulty: DifficultyKey
}
async function getPuzzle({ width, height, difficulty }: GetPregenPuzzleProps) {
	return puzzleDb.transaction('rw', puzzleDb.puzzles, async () => {
		const amount = await puzzleDb.puzzles.where({ width, height, difficulty }).count();
		if (amount === 0) {
			return null;
		}

		const matchingPuzzles = await puzzleDb.puzzles.where({ width, height, difficulty }).toArray();
		const puzzle: GeneratedPuzzle = matchingPuzzles.length > 1 ? getRandomItem(matchingPuzzles) : matchingPuzzles[0];

		await puzzleDb.puzzles.delete(puzzle.boardStr);

		return puzzle;
	})
}

function clearPuzzleDb() {
	return puzzleDb.puzzles.clear();
}

export { addPuzzle, addPuzzles, getPuzzle, clearPuzzleDb };