import { EMPTY, ONE, ROW, ZERO } from "../constants.js";
import { threeInARowRegex, validateLine, validateMaxDigitsPerLine, validateThreeInARow } from "./line.js";

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

export function findRuleConflicts(board, validateUniqueness = true) {
	const conflicts = [];

	const filledRows = {};
	const filledColumns = {};

	const { numRequired } = board;
	for (const boardLine of board.boardLines()) {
		const str = boardLine.toString();
		// three+ in a row
		const threeInARowMatches = [...str.matchAll(threeInARowRegex)];
		for (const group of threeInARowMatches) {
			const idx = group.index;
			const length = group[0].length;
			const cells = [];
			for (let i = idx; i < idx + length; i++) {
				cells.push(boardLine.getCoords(i));
			}
			conflicts.push(new RuleConflict(RULE_CONFLICT_TYPE.threeInARow, { cells }));
		}
		if (threeInARowMatches.length) continue;
		
		// imbalanced lines
		const lineType = boardLine.type;
		const maxZero = numRequired[lineType][ZERO];
		const maxOne = numRequired[lineType][ONE];
		const hasConflict = !validateMaxDigitsPerLine(str, maxZero, maxOne);
		if (hasConflict) {
			const lineIds = [boardLine.lineId];
			conflicts.push(new RuleConflict(RULE_CONFLICT_TYPE.imbalanced, { lineIds }));
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
			conflicts.push(new RuleConflict(RULE_CONFLICT_TYPE.duplicateLine, { lineIds }));
		}
	}
	return conflicts;
}

const RULE_CONFLICT_TYPE = {
	threeInARow: 'three in a row',
	imbalanced: 'imbalanced',
	duplicateLine: 'duplicate line'
}
class RuleConflict {
	constructor(type, { cells = null, lineIds = null } = {}) {
		this.type = type;

		this.cells = cells;
		this.lineIds = lineIds;
	}
}