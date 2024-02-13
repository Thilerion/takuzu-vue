import { BoardLine } from "../board/BoardLine.js";
import type { PuzzleSymbol } from "../constants.js";
import type { SimpleBoard } from "../index.js";
import type { LineId } from "../types.js";
import type { FoundIncorrectValue, UniqueLinesRuleViolation } from "./types.js";

export function findUniqueLinesRuleViolations(
	boardOrGetBoardLines: SimpleBoard | (() => Iterable<BoardLine>),
	solutionOrGetSolutionLines: SimpleBoard | (() => Iterable<BoardLine>),
): UniqueLinesRuleViolation[] {
	const results: UniqueLinesRuleViolation[] = [];

	const boardLines = typeof boardOrGetBoardLines === "function"
		? [...boardOrGetBoardLines()]
		: [...boardOrGetBoardLines.boardLines()];

	// gather filled lines first
	const filledRows: BoardLine[] = [];
	const filledCols: BoardLine[] = [];
	for (const boardLine of boardLines) {
		if (!boardLine.isFilled) continue;
		if (boardLine.type === "row") {
			filledRows.push(boardLine);
		} else {
			filledCols.push(boardLine);
		}
	}

	// compare all filledRows to all other filledRows, and if equal, group them together
	// however, need to make sure that each row is in a maximum of one group
	const duplicateLineGroups = [
		...groupEqualLines(filledRows),
		...groupEqualLines(filledCols)
	];

	const solutionLines = typeof solutionOrGetSolutionLines === "function"
		? [...solutionOrGetSolutionLines()]
		: [...solutionOrGetSolutionLines.boardLines()];

	for (const group of duplicateLineGroups) {
		const violation = createRuleViolationFromGroup(group, solutionLines);
		if (violation != null) {
			results.push(violation);
		}
	}
	return results;
}

function createRuleViolationFromGroup(
	group: BoardLine[],
	solutionLines: BoardLine[]
): UniqueLinesRuleViolation | null {
	// find the line in the group that is correct according to the solution
	const correctLine = group.find(line => {
		const solutionLine = solutionLines.find(l => l.lineId === line.lineId)!;
		if (solutionLine.toString() === line.toString()) return true;
		return false;
	});
	if (!correctLine) {
		// there is no unique line rule violation, just simply mistakes in these lines that happen to now be equal to each other
		return null;
	}
	const correctLineId = correctLine.lineId;
	const incorrectLines = group.filter(line => line.lineId !== correctLineId);
	const incorrectLineIds = incorrectLines.map(line => line.lineId);
	const lineIds = [
		correctLineId,
		...incorrectLineIds
	];

	// gather the incorrect cells in each of the incorrect lines
	const incorrectCells: FoundIncorrectValue[] = incorrectLines.flatMap(line => {
		const solutionLine = solutionLines.find(l => l.lineId === line.lineId)!;
		const diff = line.diff(solutionLine);
		return diff.map(({ x, y, values }) => {
			return {
				x,
				y,
				current: values[0] as PuzzleSymbol,
				correctValue: values[1] as PuzzleSymbol
			}
		});
	});

	return {
		type: "uniqueLines",
		lines: lineIds,
		correctLine: correctLineId,
		incorrectLines: incorrectLineIds,
		incorrectCells
	};
}

function groupEqualLines(
	filledLines: BoardLine[]
): BoardLine[][] {
	const equalLineGroups: BoardLine[][] = [];
	const visitedLines = new Set<LineId>();
	for (const line of filledLines) {
		if (visitedLines.has(line.lineId)) continue;

		const curGroup: BoardLine[] = [line];
		visitedLines.add(line.lineId);
		const lineStr = line.toString();

		for (const otherLine of filledLines) {
			if (visitedLines.has(otherLine.lineId)) continue;
			const otherStr = otherLine.toString();
			if (lineStr === otherStr) {
				curGroup.push(otherLine);
				visitedLines.add(otherLine.lineId);
			}
		}
		if (curGroup.length > 1) {
			equalLineGroups.push(curGroup);
		}
	}
	return equalLineGroups;
}