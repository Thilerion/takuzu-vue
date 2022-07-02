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

export function findRuleConflicts(board: SimpleBoard, validateUniqueness = true) {
	const conflicts: RuleConflict[] = [];

	const filledRows: Record<string, LineId[]> = {};
	const filledColumns: Record<string, LineId[]> = {};

	const { numRequired } = board;
	for (const boardLine of board.boardLines()) {
		const str = boardLine.toString();
		// three+ in a row
		const threeInARowMatches = [...str.matchAll(threeInARowRegex)];
		for (const group of threeInARowMatches) {
			if (group.index == null) continue;
			const idx = group.index;
			const length = group[0].length;
			const cells: Vec[] = [];
			for (let i = idx; i < idx + length; i++) {
				cells.push(boardLine.getCoords(i));
			}
			conflicts.push(new RuleConflict(RuleConflictType.MAX_CONSECUTIVE, { cells }));
		}
		if (threeInARowMatches.length) continue;
		
		// imbalanced lines
		const lineType = boardLine.type;
		const maxZero = numRequired[lineType][ZERO];
		const maxOne = numRequired[lineType][ONE];
		const hasConflict = !validateMaxDigitsPerLine(str, maxZero, maxOne);
		if (hasConflict) {
			const lineIds = [boardLine.lineId];
			conflicts.push(new RuleConflict(RuleConflictType.IMBALANCED, { lineIds }));
		} else if (validateUniqueness && !(str.includes(EMPTY))) {
			const filledLines = boardLine.type === ROW ? filledRows : filledColumns;

			if (!Object.keys(filledLines).includes(str)) {
				filledLines[str] = [];
			}
			filledLines[str].push(boardLine.lineId);
		}
	}

	// duplicate lines
	if (!validateUniqueness) return conflicts;

	const filledLines = { ...filledRows, ...filledColumns };
	for (const lineStr of Object.keys(filledLines)) {
		const lineIds = filledLines[lineStr];
		if (lineIds.length > 1) {
			conflicts.push(new RuleConflict(RuleConflictType.DUPLICATE_LINE, { lineIds }));
		}
	}
	return conflicts;
}

type RuleConflictData = { cells?: null | Vec[], lineIds?: null | LineId[] };
class RuleConflict {
	type: RuleConflictType;
	cells: null | Vec[];
	lineIds: null | LineId[];

	constructor(type: RuleConflictType, data: RuleConflictData = {}) {
		const { cells = null, lineIds = null } = data;
		this.type = type;
		this.cells = cells;
		this.lineIds = lineIds;
	}
}