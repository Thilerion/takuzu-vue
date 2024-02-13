import type { SimpleBoard } from "../board/Board";
import { EMPTY, ONE, ROW, ZERO } from "../constants";
import type { ColumnId, LineId, RowId, Vec } from "../types";
import { threeInARowRegex, validateLine, validateMaxDigitsPerLine } from "./line.js";
import { RuleConflictType } from './types';

export function validateBoard(board: SimpleBoard, validateUniqueness = true) {
	const filledRows: Set<RowId> = new Set();
	const filledColumns: Set<ColumnId> = new Set();

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