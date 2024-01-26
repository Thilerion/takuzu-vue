import type { SimpleBoard } from "@/lib/index.js";
import { checkTriplesStrategy } from "../../common/TriplesStrategy.js";
import type { ConstraintResult } from "./types.js";
import type { ThreesUnit } from "@/lib/board/ThreesUnit.js";

export type ApplyTriplesConstraintOpts = {
	/** Whether to stop after finding a single result and applying it. Defaults to FALSE (as opposed to the other constraint functions). */
	singleAction: boolean,
}
export type ApplyTriplesConstraintDeps = {
	/** The function to use to gather the ThreesUnits to check. Defaults to `board.threesUnits()` */
	gatherThreesUnits?: (board: SimpleBoard) => Iterable<Pick<ThreesUnit, 'coords' | 'values'>>,
}

export function applyTriplesConstraint(
	board: SimpleBoard,
	opts: ApplyTriplesConstraintOpts = { singleAction: false },
	deps: Partial<ApplyTriplesConstraintDeps> = {}
): ConstraintResult {
	const { singleAction } = opts;
	let changed = false;

	const threesUnits = deps.gatherThreesUnits ?? (board => board.threesUnits());

	for (const threesUnit of threesUnits(board)) {
		const res = checkTriplesStrategy(threesUnit);
		if (res.found) {
			const { target } = res.data;
			board.assignTarget(target);
			changed = true;

			if (singleAction) return { changed };
		}
	}
	return { changed };
}