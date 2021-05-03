import applyEliminationConstraint from "../solver/constraints/Elimination";
import applyLineBalanceConstraint from "../solver/constraints/LineBalance";
import applyTriplesConstraint from "../solver/constraints/Triples";
import Solver from "../solver/Solver";

const baseSolverConf = {
	maxSolutions: 2,
	timeoutDuration: 1000,
	throwAfterTimeout: false,
	disableBacktracking: true,
};

const difficultyConstraintFns = {
	0: [],
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

export function getMinimumDifficultyConstraints(difficultyRating) {
	if (difficultyRating <= 1) {
		// easiest difficulty puzzle is always "hard enough"
		return null;
	}

	const minDifficulty = difficultyRating - 1;
	let prevDifficultySettings = difficultyConstraintFns[minDifficulty];

	// TODO: this is a stupid hack to make sure rating 4 is hard enough
	// otherwise, rating 4 can be the same as rating 2, only with some easy "duplicateLine" move thrown in
	if (difficultyRating === 4) {
		prevDifficultySettings = [
			applyTriplesConstraint,
			applyLineBalanceConstraint,
			(board, opts = {}) => applyEliminationConstraint(board, {
				...opts,
				singleAction: false,
				maxLeast: 1,
				enforceUniqueLines: true
			}),
			(board, opts = {}) => applyEliminationConstraint(board, {
				...opts,
				singleAction: false,
				maxLeast: 2,
				enforceUniqueLines: false
			})
		]
	}
	return prevDifficultySettings;
}

export function maskHasOneSolution(maskedBoard, difficulty = 1) {
	const solutions = Solver.run(maskedBoard, {
		...baseSolverConf,
		constraintFns: difficultyConstraintFns[difficulty]
	});
	return solutions && solutions.length === 1;
}
export function maskHasNoSolution(maskedBoard, difficulty = 1) {
	const constraintFns = Array.isArray(difficulty) ? difficulty : difficultyConstraintFns[difficulty];

	const solutions = Solver.run(maskedBoard, {
		...baseSolverConf,
		constraintFns
	});
	if (!solutions) return true;
	return solutions.length === 0;
}