import { EMPTY, ONE, ROW, ZERO } from "../constants";
import { validateLine } from "./line";

export function validateBoard(board, validateUniqueness = true) {
	const filledRows = new Set();
	const filledColumns = new Set();

	const { numRequired } = board;

	for (const line of board.lineStrings()) {
		const { lineStr, lineType } = line;

		const maxZero = numRequired[lineType][ZERO];
		const maxOne = numRequired[lineType][ONE];

		if (!validateLine(lineStr, maxZero, maxOne)) return false;

		if (validateUniqueness && !(lineStr.includes(EMPTY))) {
			const filledLines = lineType === ROW ? filledRows : filledColumns;
			
			if (filledLines.has(lineStr)) return false; // duplicate line found
			filledLines.add(lineStr);
		}
	}
	return true;
}