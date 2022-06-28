import applyTriplesConstraint from "./constraints/Triples.js";
import applyLineBalanceConstraint from "./constraints/LineBalance.js";
import applyEliminationConstraint from "./constraints/Elimination.js";

import { selectCell, selectValue } from "./selection";
import { OPPOSITE_SYMBOL_MAP, type PuzzleValue } from "../constants";
import type { SimpleBoard } from "../board/Board.js";
import type { SolverConfig } from "./types.js";
import type { ConstraintFn } from "./constraints/index.js";

export default class Solver {
	maxSolutions: number;
	timeoutDuration: number;
	throwAfterTimeout: boolean;
	disableBacktracking: boolean;
	selectCell: Required<SolverConfig>['selectCell'];
	selectValue: Required<SolverConfig>['selectValue'];
	constraintFns: Required<SolverConfig>['constraintFns'];
	solutions: SimpleBoard[] = [];
	solving: boolean = false;
	finished: boolean = false;
	startTime: null | number = null;
	solveDuration: null | number = null;
	constructor(
		public initialBoard: SimpleBoard,
		config?: SolverConfig
	) {
		const conf = config ?? {};

		this.maxSolutions = conf.maxSolutions ?? 1;

		// timeout options
		this.timeoutDuration = conf.timeoutDuration ?? 2000;
		this.throwAfterTimeout = conf.throwAfterTimeout ?? false;

		// search / backtracking options
		this.disableBacktracking = conf.disableBacktracking ?? false;
		this.selectCell = conf.selectCell ?? selectCell.fewest_empty_peers;
		this.selectValue = conf.selectValue ?? selectValue.least_constraining;

		// constraints to apply while solving
		this.constraintFns = conf.constraintFns ?? [
			applyTriplesConstraint,
			applyLineBalanceConstraint,
			applyEliminationConstraint
		]

		// current solver state
		this.solving = false;
		this.finished = false;
		this.startTime = null;
		this.solveDuration = null;

		// TODO: final board if solving not successful?
	}

	static run(board: SimpleBoard, config: SolverConfig) {
		const solver = new Solver(board, config).start();
		const { solutions } = solver;
		return solutions;
	}

	// applies the first constraint that results in a change
	static applyConstraints(board: SimpleBoard, fns: ConstraintFn[] = []) {
		for (const constraintFn of fns) {
			const result = constraintFn(board);

			if (typeof result === 'object' && 'error' in result) {
				return { error: result.error };
			} else if (result) return true;
		}
		return false;
	}

	// run constraints until no more further values can be deduced, or until the board is filled
	static solveWithConstraints(board: SimpleBoard, fns: ConstraintFn[] = []) {
		while (!board.isFilled()) {
			const changed = Solver.applyConstraints(board, fns);
			if (!changed) {
				// constraints dont result in a change; no solution possible or start a search
				return board;
			} else if (typeof changed === 'object' && changed.error) {
				// running constraints resulted in an error; probably because the board was deemed unsolvable
				return false;
			}
		}
		return board;
	}
	solveWithConstraints(board: SimpleBoard) {
		return Solver.solveWithConstraints(board, this.constraintFns);
	}

	start() {
		if (this.finished) {
			console.warn('Already finished solving this board.');
			return this;
		}

		this.solving = true;
		this.startTime = performance.now();

		const board = this.solveWithConstraints(this.initialBoard.copy());

		if (!board) {
			// can't be solved
			this._finishSolving();
			return this;
		}

		if (board.isSolved()) {
			this._addSolution(board);
			// a solution was found, without backtracking, which means there is only 1 solution
			// therefore, the solver can be stopped
			this._finishSolving();
			return this;
		}

		if (!this.disableBacktracking) {
			this.search(board);
		}

		// the solver is finished after the search/backtrack has completed
		this._finishSolving();
		return this;
	}

	search(board: SimpleBoard | false): false | SimpleBoard {
		// no board: earlier a problem was found, and the current board cannot be solved
		// solving is false: _addSolution reached maxSolutions, or timeout was reached
		// board is invalid: current board cannot be solved
		if (!board || !this.solving || !board.isValid()) return false;

		if (board.isFilled()) {
			// isValid check was complete, which means, if the board isFilled, this is a solution
			// returning false will make sure the higher search calls continue the search, unless addSolution has set solving to false
			this._addSolution(board);
			return false;
		}

		if (this._solveTimeoutReached()) {
			// solving is set to false by the timeoutReached check which means the search will stop
			return false;
		}

		// initiate backtracking
		const coords = this.selectCell(board);
		if (!coords) {
			throw new Error('No cell selected');
		}
		const { x, y } = coords;
		const value = this.selectValue(board, x, y);

		return this.search(this._assignAndSolve(board.copy(), x, y, value)) ||
			this.search(this._assignAndSolve(board.copy(), x, y, OPPOSITE_SYMBOL_MAP[value]));
	}

	private _assignAndSolve(board: SimpleBoard, x: number, y: number, value: PuzzleValue) {
		const result = this.solveWithConstraints(board.assign(x, y, value));
		if (!result) return false;
		return result;
	}

	private _finishSolving() {
		this.solving = false;
		this.finished = true;
		this.solveDuration = performance.now() - (this.startTime as number);
		return this;
	}
	private _addSolution(board: SimpleBoard) {
		this.solutions.push(board.copy());
		if (this.solutions.length >= this.maxSolutions) {
			// setting solving to false will stop the search/backtrack function
			this.solving = false;
		}
		return this;
	}
	private _solveTimeoutReached() {
		if (!this.timeoutDuration) return false;
		
		const limitReached = performance.now() - (this.startTime as number) > this.timeoutDuration;

		if (limitReached && this.throwAfterTimeout) {
			// TODO: set current board to view why the timeout was reached during debugging?
			throw new Error('Solver has reached time limit.');
		} else if (limitReached) {
			console.warn('Solver has reached time limit.');
			this.solving = false;
			return true;
		}
		return false;
	}
}