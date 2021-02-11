import { EMPTY } from "../constants";
import applyEliminationConstraint from "../solver/constraints/Elimination";
import applyLineBalanceConstraint from "../solver/constraints/LineBalance";
import applyTriplesConstraint from "../solver/constraints/Triples";
import Solver from "../solver/Solver";

const solverConf = {
	maxSolutions: 2,
	timeoutDuration: 1000,
	throwAfterTimeout: false,
	disableBacktracking: true,
};

const difficultyConstraintsFns = {
	1: [
		applyTriplesConstraint,
		applyLineBalanceConstraint,
	],
	2: [
		applyTriplesConstraint,
		applyLineBalanceConstraint,
		(board, opts = {}) => applyEliminationConstraint(board, {
			...opts,
			singleAction: false,
			maxLeast: 1,
			enforceUniqueLines: false
		})
	],
	3: [
		applyTriplesConstraint,
		applyLineBalanceConstraint,
		(board, opts = {}) => applyEliminationConstraint(board, {
			...opts,
			singleAction: false,
			maxLeast: 2,
			enforceUniqueLines: false
		})
	],
	4: [
		applyTriplesConstraint,
		applyLineBalanceConstraint,
		(board, opts = {}) => applyEliminationConstraint(board, {
			...opts,
			singleAction: false,
			maxLeast: 2,
			enforceUniqueLines: true
		})
	],
	5: [
		applyTriplesConstraint,
		applyLineBalanceConstraint,
		(board, opts = {}) => applyEliminationConstraint(board, {
			...opts,
			singleAction: false,
			maxLeast: 6,
			enforceUniqueLines: true
		})
	]
};

export function createBasicMaskWithMaxDifficulty(board, maxDifficulty = 1) {
	// console.log('creating with max difficulty:', maxDifficulty);
	const constraintFns = difficultyConstraintsFns[maxDifficulty];
	const solverConfig = {
		...solverConf,
		constraintFns
	};
	if (maxDifficulty === 5) {
		solverConfig.disableBacktracking = false;
	}
	return createBasicMask(board, solverConfig);
}

export function createBasicMask(board, solverConfig = solverConf) {
	const maskedBoard = board.copy();
	const cellsIterator = maskedBoard.cells({ shuffled: true, skipEmpty: true });

	for (const { x, y, value } of cellsIterator) {
		maskedBoard.assign(x, y, EMPTY);
		if (!maskHasOneSolution(maskedBoard, solverConfig)) {
			maskedBoard.assign(x, y, value);
		}
	}
	const solution = Solver.run(maskedBoard.copy(), solverConfig);
	return maskedBoard;
}

export function maskHasOneSolution(board, solverConfig) {
	if (solverConfig.maxSolutions !== 2) {
		console.warn('HasOneSolution must always search for 2 solutions!');
		solverConfig.maxSolutions = 2;
	}

	const solutions = Solver.run(board, solverConfig);
	return solutions && solutions.length === 1;
}