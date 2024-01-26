import type { SimpleBoard } from "@/lib/index.js";
import { checkTriplesStrategy2 } from "../../common/TriplesStrategy.js";
import type { ConstraintResult } from "./types.js";
import type { ThreesUnit } from "@/lib/board/ThreesUnit.js";

export type ApplyTriplesConstraintOpts = {
	/** Whether to stop after finding a single result and applying it. Defaults to FALSE (as opposed to the other constraint functions). */
	singleAction?: boolean,
}
export type ApplyTriplesConstraintDeps = {
	/** The function to use to gather the boardLines to check. Defaults to `board.threesUnits()` */
	gatherThreesUnits?: (board: SimpleBoard) => Iterable<Pick<ThreesUnit, 'coords' | 'values'>>,
}

/*
	Test cases to use:
	'uses the gatherThreesUnits dependency to iterate over the threesUnits'
	'uses the checkTriplesStrategy2 function to check each threesUnit'
	'applies the result of checkTriplesStrategy2 to the board'
	'returns { changed: true } after the first successful application if singleAction is true'
	'returns { changed: false } if no successful application was found'
	'keeps applying the strategy results of all threesUnits if singleAction is false'
*/

export function applyTriplesConstraint(
	board: SimpleBoard,
	opts: ApplyTriplesConstraintOpts = {},
	deps: Partial<ApplyTriplesConstraintDeps> = {}
): ConstraintResult {
	const { singleAction = false } = opts;
	let changed = false;

	const threesUnits = deps.gatherThreesUnits ?? (board => board.threesUnits());

	for (const threesUnit of threesUnits(board)) {
		const res = checkTriplesStrategy2(threesUnit);
		if (res.found) {
			const { target } = res.data;
			board.assignTarget(target);
			changed = true;

			if (singleAction) return { changed };
		}
	}
	return { changed };
}