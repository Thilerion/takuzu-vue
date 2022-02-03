import { checkTriplesStrategy } from "../../strategies/Triples.js";

export default function applyTriplesConstraint(board) {
	let changed = false;

	for (const threesUnit of board.threesUnits()) {
		const { found, target } = checkTriplesStrategy(threesUnit);
		if (found) {
			const { x, y, value } = target;
			board.assign(x, y, value);
			changed = true;
		}
	}
	return changed;
}