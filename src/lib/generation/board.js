import { SimpleBoard } from "../board/Board.js";
import { COLUMN, ROW } from "../constants.js";
import { getEmptyLinePermutations } from "../permutations/index.js";
import { selectValue } from "../solver/selection.js";
import Solver from "../solver/Solver.js";
import { pickRandom } from "../utils.js";

export function generateBoard(width, height, maxAttempts = 5) {
	return new BoardGenerator(width, height, maxAttempts).start();
}

const baseSolverConf = {
	maxSolutions: 1,
	timeoutDuration: 500,
	throwAfterTimeout: false,
	selectValue: selectValue.random,
	disableBacktracking: false,
}

const getMaxSolverDuration = (width, height) => {
	const value = Math.ceil(Math.pow(((width + height) / 3), 3));
	const min = 100;
	const max = 1000;
	return Math.min(Math.max(value, min), max);
}

class BoardGenerator {
	constructor(width, height = width, maxAttempts = 5) {
		this.width = width;
		this.height = height;

		this.maxSolverDuration = getMaxSolverDuration(width, height);
		this.maxAttempts = maxAttempts;

		this.solverConfig = {
			...baseSolverConf,
			timeoutDuration: this.maxSolverDuration
		}

		// initial fill of either rows or columns, depending on which is smaller
		// starting with smaller is better (Math.min instead of Math.max)
		// this was tested, and the average was about 20% faster (5500ms / 50 boards vs 3900ms / 50 boards)
		this.initialFillSize = Math.min(this.width, this.height);
		this.initialFillType = this.width === this.initialFillSize ? ROW : COLUMN;
		
		this.possibleLines = getEmptyLinePermutations(this.initialFillSize);
	}

	start() {
		for (let i = 0; i < this.maxAttempts; i++) {
			const board = this.initialFill();
			if (!board.isValid()) {
				// TODO: remove this check if it always works
				throw new Error('Board is not valid after the initial fill during board/solution generation???');
			}

			const solutions = Solver.run(board, this.solverConfig);
			if (solutions && solutions.length) {
				return solutions[0];
			}
		}
		console.error('Board could not be generated in time / maxAttempts reached.');
		return null;
	}

	initialFill() {
		const board = SimpleBoard.empty(this.width, this.height);
		const lineIds = this.initialFillType === ROW ?
			[...board.rowIds] :
			[...board.columnIds];
		
		// select lines to fill: difference between lines must be 3 for most consistent results
		const linesToFill = [];
		for (let i = 1; i < lineIds.length - 2; i += 3) {
			linesToFill.push(lineIds[i]);
		}

		const usedLines = [];
		for (const lineId of linesToFill) {
			let line = pickRandom(this.possibleLines);
			while (usedLines.includes(line)) {
				// make sure we dont use the same line twice
				line = pickRandom(this.possibleLines);
			}
			usedLines.push(line);
			const lineValues = line.split('');
			board.assignLine(lineId, lineValues);
		}
		return board;
	}
}
