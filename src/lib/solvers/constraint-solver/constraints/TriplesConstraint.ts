import type { SimpleBoard } from "@/lib/index.js";
import { checkTriplesStrategy2 } from "../../common/TriplesStrategy.js";
import type { ConstraintResult } from "./types.js";

export function applyTriplesConstraint(board: SimpleBoard): ConstraintResult {
	let changed = false;

	for (const threesUnit of board.threesUnits()) {
		const res = checkTriplesStrategy2(threesUnit);
		if (res.found) {
			const { x, y, value } = res.data.target;
			board.assign(x, y, value);
			changed = true;
		}
	}
	return { changed };
}