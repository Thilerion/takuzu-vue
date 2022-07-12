import { applyEliminationConstraint, applyLineBalanceConstraint, applyTriplesConstraint, type ConstraintFn } from "@/lib/solver/constraints";
import Solver from "@/lib/solver/Solver";
import type { SimpleBoard } from "../board/Board";
import type { BasicPuzzleConfig, DifficultyKey } from "../types";

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
	const solutions = Solver.run(maskedBoard, {
		maxSolutions: 2,
		timeoutDuration: 2000,
		throwAfterTimeout: false,
		disableBacktracking,
		constraintFns: constraintFns as ConstraintFn[]
	})
	return solutions?.length === 1;
}

const baseCannotSolveWith = ({constraintFns, disableBacktracking = true}: BaseCannotSolveCheckOpts) => (maskedBoard: SimpleBoard) => {
	if (!Array.isArray(constraintFns)) {
		return true;
	}
	const solutions = Solver.run(maskedBoard, {
		maxSolutions: 2,
		timeoutDuration: 2000,
		throwAfterTimeout: false,
		disableBacktracking,
		constraintFns: constraintFns as ConstraintFn[]
	})
	return solutions?.length === 0;
}

export const baseConstraintFns = {
	TRIPLES: applyTriplesConstraint,
	BALANCE: applyLineBalanceConstraint,
	ELIM_1: (board: SimpleBoard) => applyEliminationConstraint(board, {
		singleAction: false,
		maxLeast: 1,
		minLeast: 1,
		enforceUniqueLines: false,
	}),
	ELIM_2: (board: SimpleBoard) => applyEliminationConstraint(board, {
		singleAction: false,
		maxLeast: 2,
		minLeast: 2,
		enforceUniqueLines: false,
	}),
	ELIM_INF: (board: SimpleBoard) => applyEliminationConstraint(board, {
		singleAction: false,
		maxLeast: Infinity,
		minLeast: 3,
		enforceUniqueLines: false
	}),
	DUPE_ELIM_1: (board: SimpleBoard) => applyEliminationConstraint(board, {
		singleAction: false,
		maxLeast: 1,
		minLeast: 1,
		enforceUniqueLines: true
	}),
	DUPE_ELIM_2: (board: SimpleBoard) => applyEliminationConstraint(board, {
		singleAction: false,
		maxLeast: 2,
		minLeast: 2,
		enforceUniqueLines: true
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