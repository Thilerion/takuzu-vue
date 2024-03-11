import { pickRandom } from "@/utils/random.utils";
import { SimpleBoard } from "../board/Board";
import { COLUMN, ROW, type LineType } from "../constants";
import { getValidLinesOfSize } from "../line-generation/memoized.js";
import { ConstraintSolver } from "../solvers/constraint-solver/ConstraintSolver.js";
import type { PuzzleSymbolLineStr } from "../types";
import { splitLine } from "../utils/puzzle-line.utils";

export function generateBoard(width: number, height: number, maxAttempts = 5) {
	return new BoardGenerator(width, height, maxAttempts).start();
}

const getMaxSolverDuration = (width: number, height: number) => {
	const value = Math.ceil(Math.pow(((width + height) / 3), 3));
	const min = 100;
	const max = 1000;
	return Math.min(Math.max(value, min), max);
}

class BoardGenerator {
	private maxSolverDuration: number;
	private readonly initialFillSize: number;
	private readonly initialFillType: LineType;
	private readonly possibleLines: ReadonlyArray<PuzzleSymbolLineStr>;

	constructor(
		public width: number,
		public height = width,
		public maxAttempts = 5
	) {
		this.maxSolverDuration = getMaxSolverDuration(width, height);

		// initial fill of either rows or columns, depending on which is smaller
		// starting with smaller is better (Math.min instead of Math.max)
		// this was tested, and the average was about 20% faster (5500ms / 50 boards vs 3900ms / 50 boards)
		this.initialFillSize = Math.min(this.width, this.height);
		this.initialFillType = this.width === this.initialFillSize ? ROW : COLUMN;
		
		this.possibleLines = getValidLinesOfSize(this.initialFillSize);
	}

	public start() {
		for (let i = 0; i < this.maxAttempts; i++) {
			const board = this.initialFill();
			if (!board.isValid()) {
				// TODO: remove this check if it always works
				throw new Error('Board is not valid after the initial fill during board/solution generation???');
			}
			const solverResult = ConstraintSolver.run(board, {
				maxSolutions: 1,
				dfs: {
					enabled: true,
					selectCell: 'fewestEmptyPeers',
					selectValue: 'random',
					timeout: this.maxSolverDuration,
					throwAfterTimeout: false
				},
				// constraints: use default constraints, so omit here
			})
			if (solverResult.numSolutions > 0) {
				return solverResult.solutions[0];
			}
		}
		console.error('Board could not be generated in time / maxAttempts reached.');
		return null;
	}

	protected initialFill() {
		const board = SimpleBoard.empty(this.width, this.height);
		const lineIds = this.initialFillType === ROW ?
			[...board.rowIds] :
			[...board.columnIds];
		
		// select lines to fill: difference between lines must be 3 for most consistent results
		const linesToFill = [];
		for (let i = 1; i < lineIds.length - 2; i += 3) {
			linesToFill.push(lineIds[i]);
		}

		const usedLines: PuzzleSymbolLineStr[] = [];
		for (const lineId of linesToFill) {
			let line = pickRandom(this.possibleLines);
			while (usedLines.includes(line)) {
				// make sure we dont use the same line twice
				line = pickRandom(this.possibleLines);
			}
			usedLines.push(line);
			const lineValues = splitLine(line);
			board.assignLine(lineId, lineValues);
		}
		return board;
	}
}
