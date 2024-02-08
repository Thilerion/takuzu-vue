import type { SimpleBoard } from "@/lib/index.js";
import type { ConstraintSolverConstraintsCollection } from "./types.js";
import type { ConstraintResult } from "./constraints/types.js";

export function applyFirstConstraintFn(board: SimpleBoard, fns: ConstraintSolverConstraintsCollection): ConstraintResult {
	for (const applyConstraint of fns) {
		const result = applyConstraint(board);
		if (result.changed) {
			return result;
		} else if (result.error != null) {
			return result;
		}
	}
	return { changed: false };
}

/** Keep applying the constraint fns to the board. After each applied change, restart at the first (easiest) constraint again. */
export function applyContraintFnsWhileChangesFound(board: SimpleBoard, fns: ConstraintSolverConstraintsCollection): ConstraintResult {
	let result = applyFirstConstraintFn(board, fns);
	while (result.changed) {
		result = applyFirstConstraintFn(board, fns);
	}
	return result;
}