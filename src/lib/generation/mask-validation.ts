import type { SimpleBoard } from "../board/Board";
import type { BasicPuzzleConfig, DifficultyKey } from "../types";
import { ConstraintSolver } from "../solvers/constraint-solver/ConstraintSolver.js";
import { applyTriplesConstraintWithOpts } from "../solvers/constraint-solver/constraints/TriplesConstraint.js";
import { applyLineBalanceConstraintWithOpts } from "../solvers/constraint-solver/constraints/LineBalanceConstraint.js";
import { applyEliminationConstraintWithOpts } from "../solvers/constraint-solver/constraints/EliminationConstraint.js";

// TODO: simplify these types and functions

type BaseSolveCheckOpts = {
	disableBacktracking?: boolean,
	constraintFns: DifficultyConstraintFnValue
}
type BaseCannotSolveCheckOpts = {
	disableBacktracking?: boolean,
	constraintFns: DifficultyConstraintFnValueOrNull
}
const baseCanSolveWith = ({constraintFns, disableBacktracking = true}: BaseSolveCheckOpts) => (maskedBoard: SimpleBoard) => {
	const solverResult = ConstraintSolver.run(
		maskedBoard,
		{
			maxSolutions: disableBacktracking ? 1 : 2,
			dfs: {
				enabled: !disableBacktracking,
				timeout: 2000,
			},
			constraints: constraintFns as any[]
		}
	)
	return solverResult.numSolutions === 1;
}

const baseCannotSolveWith = ({constraintFns, disableBacktracking = true}: BaseCannotSolveCheckOpts) => (maskedBoard: SimpleBoard) => {
	if (!Array.isArray(constraintFns)) {
		return true;
	}
	const solverResult = ConstraintSolver.run(
		maskedBoard,
		{
			maxSolutions: disableBacktracking ? 1 : 2,
			dfs: {
				enabled: !disableBacktracking,
				timeout: 2000,
			},
			constraints: constraintFns as any[]
		}
	)
	return solverResult.numSolutions === 0;
}

const triplesMulti = applyTriplesConstraintWithOpts({ singleAction: false });
const balanceMulti = applyLineBalanceConstraintWithOpts({ singleAction: false });

export const baseConstraintFns = {
	TRIPLES: triplesMulti,
	BALANCE: balanceMulti,
	ELIM_1: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, 1],
		useDuplicateLines: false
	}),
	ELIM_2: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [2, 2],
		useDuplicateLines: false
	}),
	ELIM_INF: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [3, Infinity],
		useDuplicateLines: false
	}),
	DUPE_ELIM_1: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, 1],
		useDuplicateLines: true
	}),
	DUPE_ELIM_2: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [2, 2],
		useDuplicateLines: true
	}),
	BACKTRACKING: 'BACKTRACKING'
} as const;

type BaseValidateConstraintFnMap = typeof baseConstraintFns;
type BaseValidateConstraintFnTypes = keyof BaseValidateConstraintFnMap;
type BaseValidateConstraintFnValues = BaseValidateConstraintFnMap[BaseValidateConstraintFnTypes];
type DifficultyConstraintFnValue = BaseValidateConstraintFnValues[];
type DifficultyConstraintFnValueOrNull = null | DifficultyConstraintFnValue;

type DefaultDifficultyConstraintFns = Record<
	DifficultyKey,
	({
		canNotSolveWithConstraints: DifficultyConstraintFnValueOrNull,
		canSolveWithConstraints: DifficultyConstraintFnValue
	})
>

const defaultDifficultyConstraintFns: DefaultDifficultyConstraintFns = {
	1: {
		canNotSolveWithConstraints: null,
		canSolveWithConstraints: [
			baseConstraintFns.TRIPLES,
			baseConstraintFns.BALANCE
		]
	},
	2: {
		canNotSolveWithConstraints: [
			baseConstraintFns.TRIPLES,
			baseConstraintFns.BALANCE
		],
		canSolveWithConstraints: [
			baseConstraintFns.TRIPLES,
			baseConstraintFns.BALANCE,
			baseConstraintFns.ELIM_1
		]
	},
	3: {
		canNotSolveWithConstraints: [
			baseConstraintFns.TRIPLES,
			baseConstraintFns.BALANCE,
			baseConstraintFns.ELIM_1
		],
		canSolveWithConstraints: [
			baseConstraintFns.TRIPLES,
			baseConstraintFns.BALANCE,
			baseConstraintFns.ELIM_1,
			baseConstraintFns.ELIM_2
		]
	},
	4: {
		canNotSolveWithConstraints: [
			baseConstraintFns.TRIPLES,
			baseConstraintFns.BALANCE,
			baseConstraintFns.ELIM_1,
			baseConstraintFns.ELIM_2
		],
		canSolveWithConstraints: [
			baseConstraintFns.TRIPLES,
			baseConstraintFns.BALANCE,
			baseConstraintFns.ELIM_1,
			baseConstraintFns.ELIM_2,
			baseConstraintFns.DUPE_ELIM_1
		]
	},
	5: {
		canNotSolveWithConstraints: [
			baseConstraintFns.TRIPLES,
			baseConstraintFns.BALANCE,
			baseConstraintFns.ELIM_1,
			baseConstraintFns.ELIM_2,
			baseConstraintFns.DUPE_ELIM_1,
			baseConstraintFns.DUPE_ELIM_2
		],
		canSolveWithConstraints: [
			baseConstraintFns.TRIPLES,
			baseConstraintFns.BALANCE,
			baseConstraintFns.ELIM_1,
			baseConstraintFns.ELIM_2,
			baseConstraintFns.DUPE_ELIM_1,
			baseConstraintFns.DUPE_ELIM_2,
			baseConstraintFns.BACKTRACKING
		]
	}
}
type MaskValidator = {
	canSolveWith: ReturnType<typeof baseCanSolveWith>,
	canNotSolveWith: ReturnType<typeof baseCannotSolveWith>
}
const overrideDifficultyConstraintFns: Record<string, MaskValidator> = {
	'6x6-3': {
		canSolveWith: baseCanSolveWith({ constraintFns: defaultDifficultyConstraintFns[4].canSolveWithConstraints}),
		canNotSolveWith: baseCannotSolveWith({ constraintFns: defaultDifficultyConstraintFns[4].canNotSolveWithConstraints})
	},
}

export const getMaskValidatorsForPuzzleConfig = ({ width, height, difficulty }: BasicPuzzleConfig): MaskValidator => {
	const overrideKey = `${width}x${height}-${difficulty}`;

	if (overrideDifficultyConstraintFns[overrideKey] != null) {
		return overrideDifficultyConstraintFns[overrideKey];
	}

	let {
		canNotSolveWithConstraints,
		canSolveWithConstraints
	} = defaultDifficultyConstraintFns[difficulty];

	let canSolveWithBacktrackingDisabled = true;

	if (canSolveWithConstraints.includes(baseConstraintFns.BACKTRACKING)) {
		canSolveWithConstraints = canSolveWithConstraints.filter(val => val !== baseConstraintFns.BACKTRACKING);
		canSolveWithBacktrackingDisabled = false;
	}

	const canSolveWith = baseCanSolveWith({ constraintFns: canSolveWithConstraints, disableBacktracking: canSolveWithBacktrackingDisabled });
	const canNotSolveWith = baseCannotSolveWith({ constraintFns: canNotSolveWithConstraints});
	return { canSolveWith, canNotSolveWith };
}