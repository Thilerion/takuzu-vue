import { applyEliminationConstraintWithOpts } from "../solvers/constraint-solver/constraints/EliminationConstraint.js"
import { applyLineBalanceConstraintWithOpts } from "../solvers/constraint-solver/constraints/LineBalanceConstraint.js"
import { applyTriplesConstraintWithOpts } from "../solvers/constraint-solver/constraints/TriplesConstraint.js"
import type { ConstraintSolverConstraintsCollection } from "../solvers/constraint-solver/types.js"
import type { BasicPuzzleConfig, BoardShape, DifficultyKey } from "../types.js"

export type MaskMinDifficultyConfig = null | {
	constraints: ConstraintSolverConstraintsCollection,
	backtracking?: false, // backtracking is not needed for checking if a puzzle is too easy, though it might be in the future when backtracking depth is used
}
export type MaskMaxDifficultyConfig = {
	constraints: ConstraintSolverConstraintsCollection,
	backtracking: boolean,
}

type DifficultyConfigOverrideFn = (boardShape: BoardShape, min: MaskMinDifficultyConfig, max: MaskMaxDifficultyConfig) => ({ min: MaskMinDifficultyConfig, max: MaskMaxDifficultyConfig })

export type MaskDifficultyConfig<Level extends DifficultyKey = DifficultyKey> = {
	level: Level,
	min: MaskMinDifficultyConfig,
	max: MaskMaxDifficultyConfig,
	overrides: DifficultyConfigOverrideFn[],
}
export type DifficultyConfigMap = {
	[Level in DifficultyKey]: MaskDifficultyConfig<Level>
}

const CONSTRAINTS = {
	triples: applyTriplesConstraintWithOpts({ singleAction: false }),
	balance: applyLineBalanceConstraintWithOpts({ singleAction: false }),
	elim1: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, 1],
		useDuplicateLines: false,
	}),
	elim1_2: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, 2],
		useDuplicateLines: false,
	}),
	elim1_3: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, 3],
		useDuplicateLines: false,
	}),
	elim1_inf: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, Infinity],
		useDuplicateLines: false,
	}),
	dupe1_single: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, 1],
		useDuplicateLines: true,
		maxEmptyCells: 2, // So only comparing a line to another line that has 1 remaining of both symbols
	}),
	dupe1: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, 1],
		useDuplicateLines: true,
	}),
	dupe1_2: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, 2],
		useDuplicateLines: true,
	}),
	dupe1_inf: applyEliminationConstraintWithOpts({
		singleAction: false,
		leastRemainingRange: [1, Infinity],
		useDuplicateLines: true,
	}),
}

export const difficultyConfigs: DifficultyConfigMap = {
	1: {
		level: 1,
		min: null,
		max: {
			backtracking: false,
			constraints: [
				CONSTRAINTS.triples,
				CONSTRAINTS.balance,
			]
		},
		overrides: []
	},
	2: {
		level: 2,
		min: {
			constraints: [
				CONSTRAINTS.triples,
				CONSTRAINTS.balance,
			],
		},
		max: {
			backtracking: false,
			constraints: [
				CONSTRAINTS.triples,
				CONSTRAINTS.balance,
				CONSTRAINTS.elim1,
			]
		},
		overrides: []
	},
	3: {
		level: 3,
		min: {
			constraints: [
				CONSTRAINTS.triples,
				CONSTRAINTS.balance,
				CONSTRAINTS.elim1,
			],
		},
		max: {
			backtracking: false,
			constraints: [
				CONSTRAINTS.triples,
				CONSTRAINTS.balance,
				CONSTRAINTS.elim1_2,
			]
		},
		overrides: [
			// If board is smaller or equal to 6x6, add a dupe1 constraint
			({ width, height }, origMin, origMax) => {
				if (width > 6 || height > 6) return { min: origMin, max: origMax };
				const newMin = {
					constraints: [...origMax.constraints]
				}
				const newMax = {
					backtracking: false,
					constraints: [
						...origMax.constraints,
						CONSTRAINTS.dupe1_single
					]
				}
				return { min: newMin, max: newMax }
			}
		]
	},
	4: {
		level: 4,
		min: {
			constraints: [
				CONSTRAINTS.triples,
				CONSTRAINTS.balance,
				CONSTRAINTS.elim1_2,
			],
		},
		max: {
			backtracking: false,
			constraints: [
				CONSTRAINTS.triples,
				CONSTRAINTS.balance,
				CONSTRAINTS.elim1_inf,
				CONSTRAINTS.dupe1_single,
			]
		},
		overrides: []
	},
	5: {
		level: 5,
		min: {
			constraints: [
				CONSTRAINTS.triples,
				CONSTRAINTS.balance,
				CONSTRAINTS.elim1_inf,
				CONSTRAINTS.dupe1_inf,
			],
		},
		max: {
			backtracking: true,
			constraints: [
				CONSTRAINTS.triples,
				CONSTRAINTS.balance,
				CONSTRAINTS.elim1_inf,
				CONSTRAINTS.dupe1_inf,
			]
		},
		overrides: []
	},
};

export const getDifficultyConfig = (puzzleConf: BasicPuzzleConfig) => {
	const { difficulty } = puzzleConf;
	const config = difficultyConfigs[difficulty];

	let resMin = config.min;
	let resMax = config.max;

	for (const override of config.overrides) {
		const overrideRes = override(puzzleConf, resMin, resMax);
		resMin = overrideRes.min;
		resMax = overrideRes.max;
	}
	return {
		...config,
		min: resMin,
		max: resMax,
	}
}