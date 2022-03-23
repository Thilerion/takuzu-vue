import { formatBasicSortableDateKey } from "@/utils/date.utils.js";
import { dimensionsToBoardType } from "@/config.js";

export class PuzzleData {
	constructor(data) {
		if (data == null) throw new Error('No data in PuzzleData constructor.');
		if (typeof data.initialBoard !== 'string') {
			throw new Error('InitialBoard and SolutionBoard must both be strings. Convert them first before creating puzzleData. Should probably use PuzzleData.fromGameState');
		}	
		
		this.width = data.width;
		this.height = data.height;

		this.difficulty = data.difficulty;
		this.initialBoard = data.initialBoard;
		this.solution = data.solution;

		this.date = data.date;
		this.timeElapsed = data.timeElapsed;

		// if newly created, id is undefined and won't be added to database
		// if retrieved from database however, id has a value
		this.id = data.id ?? undefined;

		this.flags = data.flags ?? {};
	}

	get isSaved() {
		return this.id != null;
	}

	static fromGameState(gameState) {
		if (gameState == null || gameState.timeElapsedUnmount == null) {
			throw new Error('Invalid gameState; cannot turn this into a PuzzleData entry');
		}

		const timeElapsed = gameState.timeElapsedUnmount;
		const date = Date.now();

		const { width, height, difficulty } = gameState;
		const initialBoard = gameState.initialBoard.toBoardString();
		const solution = gameState.solution.toBoardString();

		return new PuzzleData({
			width, height, difficulty, initialBoard, solution, timeElapsed, date
		});
	}

	static fromPuzzleState(puzzleState) {
		if (puzzleState == null) {
			throw new Error('Invalid puzzleState; cannot turn this into a PuzzleData entry');
		}

		const { width, height, difficulty, timeElapsed } = puzzleState;
		const date = Date.now();
		const initialBoard = puzzleState.initialBoard.toBoardString();
		const solution = puzzleState.solution.toBoardString();
		return new PuzzleData({
			width, height, difficulty, initialBoard, solution, timeElapsed, date
		});
	}
}

export class PuzzleStatisticData extends PuzzleData {
	constructor(data) {
		super(data);

		this.boardType = dimensionsToBoardType(this.width, this.height);
		
		this.dateMs = this.date;
		this.date = new Date(this.dateMs);
		
		this.dateStr = formatBasicSortableDateKey(this.date);

		this.dimensions = `${this.width}x${this.height}`;
		this.dimensionDifficultyStr = `${this.dimensions}-${this.difficulty}`;
		
		this.timeElapsedAdjusted = this.calculateAdjustedTimeElapsed();
	}

	calculateAdjustedTimeElapsed(fromBase = 100) {
		const numCells = this.width * this.height;
		const ratio = numCells / fromBase;
		return Math.round(this.timeElapsed / ratio);
	}
}