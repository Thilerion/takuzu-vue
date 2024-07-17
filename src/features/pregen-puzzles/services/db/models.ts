import type { BoardExportString, BoardShape, DifficultyKey } from "@/lib/types.js";

// TODO: use { board, solution } instead of { boardStr, solutionStr }, just like everywhere else
export type IPregenPuzzle = BoardShape & {
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
	populated?: boolean | 0 | 1; // whether it was set as part of database initial population

	constructor({
		boardStr, solutionStr,
		difficulty,
		width, height, populated
	}: IPregenPuzzle & { populated?: boolean | 0 | 1 }) {
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