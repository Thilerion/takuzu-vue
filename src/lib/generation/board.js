import { SimpleBoard } from "../board/Board";
import { COLUMN, ROW } from "../constants";
import { getEmptyLinePermutations } from "../permutations";
import Solver from "../solver/Solver";
import { pickRandom } from "../utils";

const { selectValue } = require("../solver/selection");

const solverConf = {
	maxSolutions: 1,
	timeoutDuration: 400,
	throwAfterTimeout: true,
	selectValue: selectValue.random,
	disableBacktracking: false
};

export function generateBoard(width, height = width) {
	const boardGen = new BoardGenerator(width, height);
	return boardGen.start();
}

export class BoardGenerator {
	constructor(width, height = width) {
		this.width = width;
		this.height = height;

		this.maxDuration = 1000;

		const baseSolverMaxDuration = Math.ceil(Math.pow(((width + height) / 4), 3));
		const solverMaxDuration = Math.min(Math.max(baseSolverMaxDuration, 100), this.maxDuration);

		this.solverConf = {
			...solverConf,
			timeoutDuration: solverMaxDuration
		};

		this.initialFillSize = Math.max(this.width, this.height);
		this.initialFillType = this.width === this.initialFillSize ? ROW : COLUMN;
		this.emptyLinePermutations = getEmptyLinePermutations(this.initialFillSize);
	}

	start() {
		const startTime = performance.now();
		const endTime = this.maxDuration ? (startTime + this.maxDuration) : Infinity;

		// TODO: rework loop with maxAttempts and maxDuration
		while (true) {
			const board = this._initialFill();
			const timeLeft = endTime - performance.now();
			if (timeLeft < 0) {
				break;
			}
			if (!board.isValid()) {
				throw new Error('This should not happen I think? Only happens if initialFillLine made a mistake.');
			}

			const solutions = Solver.run(board, {
				...this.solverConf,
				timeoutDuration: Math.min(Math.max(this.solverConf.timeoutDuration, 40), timeLeft)
			});

			if (!solutions || !solutions.length) {
				continue;
			}
			return solutions[0];
		}
		console.error('Board could not be generated in time...');
		return null;
	}

	_initialFill() {
		const board = SimpleBoard.empty(this.width, this.height);
		const lineIds = this.initialFillType === ROW ? [...board.rowIds] : [...board.columnIds];

		// initially fill board line 0, then line 2 and each line with difference 3 after
		// setting latest row to fill to lineSize - 1 gave better results then being able to fill the absolute last line, better and more consistent

		const lastLine = this.width === this.initialFillSize ? (this.height - 1) : (this.width - 1);

		const linesToFill = [];
		for (let i = 0; i < lastLine; i += 3) {
			linesToFill.push(lineIds[i]);
		}

		const usedLines = [];

		for (const lineId of linesToFill) {
			let line = pickRandom(this.emptyLinePermutations);
			while (usedLines.includes(line)) {
				line = pickRandom(this.emptyLinePermutations);
			}
			usedLines.push(line);
			const lineValues = line.split('');
			board.assignLine(lineId, lineValues);
		}
		return board;
	}
}