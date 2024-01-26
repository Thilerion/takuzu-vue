import type { SimpleBoard } from "@/lib/board/Board";
import { checkTriplesStrategy } from "@/lib/solvers/common/TriplesStrategy.js";

export default function applyTriplesConstraint(board: SimpleBoard) {
	let changed = false;

	for (const threesUnit of board.threesUnits()) {
		const res = checkTriplesStrategy(threesUnit);
		if (res.found) {
			const { x, y, value } = res.data.target;
			board.assign(x, y, value);
			changed = true;
		}
	}
	return changed;
}