import Dexie from "dexie";
import { GeneratedPuzzle, type IPregenPuzzle } from "./models.js";
import type { BasicPuzzleConfig, BoardExportString } from "@/lib/types.js";
import { getRandomItem } from "@/utils/array.ts.utils.js";

class PregenPuzzlesDb extends Dexie {
	puzzles!: Dexie.Table<GeneratedPuzzle, BoardExportString>;

	constructor() {
		super("PuzzleDB");

		this.version(1).stores({
			puzzles: "boardStr,solutionStr,[width+height],difficulty,[width+height+difficulty]"
		})

		this.puzzles.mapToClass(GeneratedPuzzle);

		this.on('ready', () => {
			console.log('Puzzles database is ready.');
		})
	}

	addPuzzle(puzzle: IPregenPuzzle) {
		return this.puzzles.add(new GeneratedPuzzle(puzzle));
	}
	addPuzzles(puzzles: IPregenPuzzle[]) {
		if (!puzzles.length) return;

		const genPuzzles = puzzles.map(data => {
			return new GeneratedPuzzle(data);
		})

		return this.puzzles
			.bulkAdd(genPuzzles)
			.then(() => {
				console.log('Puzzles saved succesfully.');
			}).catch(err => {
				console.warn('Puzzles could not be saved to database.');
				console.error(err);
				throw err;
			});
	}
	putPuzzles(puzzles: IPregenPuzzle[]) {
		return this.puzzles.bulkPut(puzzles);
	}
	getPuzzle({ width, height, difficulty }: BasicPuzzleConfig) {
		return this.transaction('rw', this.puzzles, async () => {
			const amount = await this.puzzles.where({ width, height, difficulty }).count();
			if (amount === 0) {
				return null;
			}
	
			const matchingPuzzles = await this.puzzles.where({ width, height, difficulty }).toArray();
			const puzzle: GeneratedPuzzle = matchingPuzzles.length > 1 ? getRandomItem(matchingPuzzles) : matchingPuzzles[0];
	
			await this.puzzles.delete(puzzle.boardStr);
	
			return puzzle;
		})
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

const puzzleDb = new PregenPuzzlesDb();

export {
	type PregenPuzzlesDb,
	puzzleDb
}