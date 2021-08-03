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

function createConstraintFn({
	triples = true,
	balance = true,
	elimination,
	duplicate
}) {
	const result = [];
	if (triples) result.push(applyTriplesConstraint);
	if (balance) result.push(applyLineBalanceConstraint);
	if (elimination != null) {
		const { maxLeast = 1, enforceUniqueLines = false } = elimination;
		const elimOpts = {
			singleAction: false,
			maxLeast: maxLeast > 0 ? maxLeast : 1,
			enforceUniqueLines
		}
		const fn = (board, opts = {}) => applyEliminationConstraint(board, {
			...opts,
			...elimOpts
		});
		result.push(fn);
	}
	if (duplicate != null) {
		const { maxLeast = 1 } = duplicate;
		const elimOpts = {
			singleAction: false,
			maxLeast: maxLeast > 0 ? maxLeast : 1,
			enforceUniqueLines: true
		}
		const fn = (board, opts = {}) => applyEliminationConstraint(board, {
			...opts,
			...elimOpts
		});
		result.push(fn);
	}
	return result;
}

const difficultyConstraintFns = {
	0: [],
	1: createConstraintFn({ triples: true, balance: true }),
	2: createConstraintFn({
		triples: true, balance: true,
		elimination: { enforceUniqueLines: false, maxLeast: 1 }
	}),
	3: createConstraintFn({
		triples: true, balance: true,
		elimination: { enforceUniqueLines: false, maxLeast: 2 }
	}),
	4: createConstraintFn({
		triples: true, balance: true,
		elimination: { enforceUniqueLines: false, maxLeast: 2 },
		duplicate: { maxLeast: 1 },
	}),
	5: createConstraintFn({
		triples: true, balance: true,
		elimination: { enforceUniqueLines: false, maxLeast: 6 },
		duplicate: { maxLeast: 2 },
	}),
};
const minDifficultyConstraintFns = {};
for (const difficultyValue of Object.keys(difficultyConstraintFns)) {
	const minDiff = difficultyValue - 1;
	if (minDiff < 1) {
		minDifficultyConstraintFns[difficultyValue] = null;
	} else {
		let minConstraints = difficultyConstraintFns[minDiff];
		if (!minConstraints || (Array.isArray(minConstraints) && !minConstraints.length)) {
			minConstraints = null;
		}
		minDifficultyConstraintFns[difficultyValue] = difficultyConstraintFns[minDiff];
	}
}

const smallPuzzleDifficultyConstraintFns = {
	3: {
		min: createConstraintFn({
			triples: true, balance: true,
			elimination: { enforceUniqueLines: false, maxLeast: 1 },
		}),
		max: createConstraintFn({
			triples: true, balance: true,
			elimination: { enforceUniqueLines: false, maxLeast: 1 },
			duplicate: { maxLeast: 1 }
		}),
	}
};

export function getDifficultyConstraintFns(difficultyRating, width, height) {
	const numCells = width * height;

	const validKeys = [...Object.keys(smallPuzzleDifficultyConstraintFns), ...Object.keys(smallPuzzleDifficultyConstraintFns).map(str => Number(str))];
	if (numCells <= 60 && validKeys.includes(difficultyRating)) {
		return smallPuzzleDifficultyConstraintFns[difficultyRating].max;
	}
	return difficultyConstraintFns[difficultyRating];
}


export function getMinimumDifficultyConstraints(difficultyRating, width, height) {
	const numCells = width * height;
	const validKeys = [...Object.keys(smallPuzzleDifficultyConstraintFns), ...Object.keys(smallPuzzleDifficultyConstraintFns).map(str => Number(str))];
	if (numCells <= 60 && validKeys.includes(difficultyRating)) {
		return smallPuzzleDifficultyConstraintFns[difficultyRating].min;
	}

	return minDifficultyConstraintFns[difficultyRating];
}

export function maskHasOneSolution(maskedBoard, difficulty = 1) {
	const solutions = Solver.run(maskedBoard, {
		...baseSolverConf,
		constraintFns: getDifficultyConstraintFns(difficulty, maskedBoard.width, maskedBoard.height)
	});
	return solutions && solutions.length === 1;
}
export function maskHasNoSolution(maskedBoard, difficulty = 1) {
	const constraintFns = difficulty;
	if (!Array.isArray(difficulty)) {
		console.warn({ difficulty });
		return true;
	}

	const solutions = Solver.run(maskedBoard, {
		...baseSolverConf,
		constraintFns
	});
	if (!solutions) return true;
	return solutions.length === 0;
}