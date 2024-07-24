import type { SimpleBoard } from "@/lib/board/Board.js";
import type { ConstraintSolverConstraintsCollection } from "../types.js";
import type { ConstraintResult } from "../constraints/types.js";
import { applyEliminationConstraintWithOpts } from "../constraints/EliminationConstraint.js";
import { applyLineBalanceConstraintWithOpts } from "../constraints/LineBalanceConstraint.js";
import { applyTriplesConstraintWithOpts } from "../constraints/TriplesConstraint.js";

const getDefaultConstraintFns = (): ConstraintSolverConstraintsCollection => {
	return [
		applyTriplesConstraintWithOpts({ singleAction: false }),
		applyLineBalanceConstraintWithOpts({ singleAction: false }),
		applyEliminationConstraintWithOpts({ singleAction: true, leastRemainingRange: [1, 3], useDuplicateLines: true }), // TODO: debatable if useDuplicateLines should default to true
	]
}

export type ConstraintsHandlerConfig = {
	// TODO: implement ConstraintsCollection "presets", which can be selected by name
	constraints: ConstraintSolverConstraintsCollection | 'default',
};

export class ConstraintsHandler {
    private constraints: ConstraintSolverConstraintsCollection;

    constructor(constraints: ConstraintSolverConstraintsCollection) {
        this.constraints = constraints;
    }

	static getDefaultConstraints(): ConstraintSolverConstraintsCollection {
		return getDefaultConstraintFns();
	}

	static fromConfig(config: ConstraintsHandlerConfig): ConstraintsHandler {
		const { constraints } = config;
		if (constraints === 'default') {
			return new ConstraintsHandler(ConstraintsHandler.getDefaultConstraints());
		} else {
			return new ConstraintsHandler(constraints);
		}
	}

	private applyFirstConstraintFn(board: SimpleBoard): ConstraintResult {
		for (const applyConstraint of this.constraints) {
			const result = applyConstraint(board);
			if (result.changed) {
				return result;
			} else if (result.error != null) {
				return result;
			}
		}
		return { changed: false };
	}

    /**
     * Applies all constraints to the given board until no more changes can be made.
     * @param board The board to apply constraints to.
     * @returns A ConstraintResult indicating whether changes were made and if any errors occurred.
     */
    applyConstraints(board: SimpleBoard): ConstraintResult {
		let result = this.applyFirstConstraintFn(board);
		let hasChanged = result.changed;
		
		while (result.changed) {
			result = this.applyFirstConstraintFn(board);
			hasChanged = hasChanged || result.changed;
		}

		if (hasChanged && result.error == null) {
			// If any application of the constraints has changed the board, and there is no error, we can return { changed: true }
			return { changed: true };
		}
		return result;
    }
}