import type { BasicPuzzleConfig, BoardExportString, DifficultyKey, PuzzleConfigKey } from "@/lib/types.js";
import Dexie from "dexie";
import { GeneratedPuzzle, type IPregenPuzzle } from "./models.js";
import { pickRandom } from "@/utils/random.utils.js";
import { isDifficultyKey } from "@/config.js";

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

	takePuzzle({
		width, height, difficulty
	}: BasicPuzzleConfig) {
		return this.transaction('rw', this.puzzles, async () => {
			const amount = await this.puzzles.where({ width, height, difficulty }).count();
			if (amount === 0) {
				return null;
			}
	
			const matchingPuzzles = await this.puzzles.where({ width, height, difficulty }).toArray();
			const puzzle: GeneratedPuzzle = matchingPuzzles.length > 1 ? pickRandom(matchingPuzzles) : matchingPuzzles[0];
	
			await this.puzzles.delete(puzzle.boardStr);
	
			return puzzle;
		})
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

	async countByPuzzleConfigs(): Promise<Map<PuzzleConfigKey, number>> {
		const result = new Map<PuzzleConfigKey, number>();
		const puzzleKeys = await this.puzzles.orderBy('[width+height+difficulty]').keys();

		for (const puzzle of puzzleKeys) {
			if (!isValidDbPuzzleConfigKey(puzzle)) {
				throw new Error(`Invalid puzzle config key found in database: ${puzzle}`);
			}
			const [width, height, difficulty] = puzzle;
			const key: PuzzleConfigKey = `${width}x${height}-${difficulty as DifficultyKey}`;
			const count = result.get(key) ?? 0;
			result.set(key, count + 1);
		}
		return result;
	}
}

let _instance: PregenPuzzlesDb | null = null;
const getPuzzleDb = (): PregenPuzzlesDb => {
	if (_instance == null) {
		_instance = new PregenPuzzlesDb();
	}
	return _instance;
}

export {
	type PregenPuzzlesDb,
	getPuzzleDb
}

function isValidDbPuzzleConfigKey(value: unknown): value is [w: number, h: number, d: DifficultyKey] {
	if (!Array.isArray(value) || value.length !== 3) return false;
	if (typeof value[0] !== 'number' || typeof value[1] !== 'number') return false;
	if (!isDifficultyKey(value[2])) return false;
	return true;
}