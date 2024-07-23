import type { SimpleBoard } from "@/lib/board/Board.js";
import type { ConstraintSolverConstraintsCollection } from "./types.js";
import type { ConstraintResult } from "./constraints/types.js";
import type { BoardExportString } from "@/lib/types.js";

export type BoardStatus = 'solved' | 'invalid' | 'unsolved';

export class ConstraintsHandler {
    private constraints: ConstraintSolverConstraintsCollection;
	private lastStatusResult: { 
		board: BoardExportString,
		result: BoardStatus
	} | null = null;

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

    /**
     * Gets the current status of the board.
     * @param board The board to check.
     * @returns 'solved' if the board is solved, 'invalid' if it's in an invalid state, or 'unsolved' otherwise.
     */
    getBoardStatus(board: SimpleBoard): BoardStatus {
		// TODO: check if this lastStatusResult check is faster than simply running the checkStatus functions
		const boardExport = board.export();
		if (this.lastStatusResult?.board === boardExport) {
			return this.lastStatusResult.result;
		}
		const isValid = board.isValid();
		const isSolved = isValid && board.isFilled();
		
		const status = !isValid ? 'invalid' : isSolved ? 'solved' : 'unsolved';
		this.lastStatusResult = { board: boardExport, result: status };

        return status;
    }
}