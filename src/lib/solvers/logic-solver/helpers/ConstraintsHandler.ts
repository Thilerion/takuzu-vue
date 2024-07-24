import type { SimpleBoard } from "@/lib/board/Board.js";
import type { ConstraintSolverConstraintsCollection } from "../types.js";
import type { ConstraintResult } from "../constraints/types.js";

export class ConstraintsHandler {
    private constraints: ConstraintSolverConstraintsCollection;

    constructor(constraints: ConstraintSolverConstraintsCollection) {
        this.constraints = constraints;
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