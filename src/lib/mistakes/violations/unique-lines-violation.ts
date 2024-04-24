import type { BoardLine } from "@/lib/board/BoardLine.js";
import type { LineType, PuzzleSymbol } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import type { LineId } from "@/lib/types.js";
import type { UniqueLinesRuleViolation, FoundIncorrectValue } from "../types.js";

export function findUniqueLinesRuleViolations(
	boardOrGetBoardLines: SimpleBoard | (() => Iterable<BoardLine>),
	solutionOrGetSolutionLines: SimpleBoard | (() => Iterable<BoardLine>),
): UniqueLinesRuleViolation[] {
	const boardLines = typeof boardOrGetBoardLines === "function"
		? [...boardOrGetBoardLines()]
		: [...boardOrGetBoardLines.boardLines()];

	// Collect filled rows and filled columns on the board
	const filledLines = getFilledLines(boardLines);

	// Group filled rows and filled columns that are equal to each other
	const duplicateLineGroups = [
		...groupEqualLines(filledLines.row),
		...groupEqualLines(filledLines.column)
	];

	if (!duplicateLineGroups.length) return [];

	const results: UniqueLinesRuleViolation[] = [];
	const solutionLines = typeof solutionOrGetSolutionLines === "function"
		? [...solutionOrGetSolutionLines()]
		: [...solutionOrGetSolutionLines.boardLines()];

	// For each group, find the "correctLine" and "incorrectLines" according to the solution,
	// and create a UniqueLinesRuleViolation object
	for (const group of duplicateLineGroups) {
		// Find the correct line in the group by comparing to the solution. If there are none, correctLine is null.
		const correctLine = group.find(line => {
			return solutionLines.some(sl => sl.equalsStrict(line))
		});
		const correctLineId = correctLine?.lineId ?? null;
		
		const incorrectLines = group.filter(line => line.lineId !== correctLineId);
		const incorrectLineIds = incorrectLines.map(line => line.lineId);
		
		const lineIds = [...incorrectLineIds];
		if (correctLineId) lineIds.push(correctLineId);
		lineIds.sort((a, z) => a.localeCompare(z, undefined, { numeric: true }));

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

		const violation: UniqueLinesRuleViolation = {
			type: 'uniqueLines',
			correctLine: correctLineId,
			lines: lineIds,
			incorrectLines: incorrectLineIds,
			incorrectCells
		}
		results.push(violation);
	}

	return results;
}

export function findUniqueLinesRuleViolationsOLD(
	boardOrGetBoardLines: SimpleBoard | (() => Iterable<BoardLine>),
	solutionOrGetSolutionLines: SimpleBoard | (() => Iterable<BoardLine>),
): UniqueLinesRuleViolation[] {
	const results: UniqueLinesRuleViolation[] = [];

	const boardLines = typeof boardOrGetBoardLines === "function"
		? [...boardOrGetBoardLines()]
		: [...boardOrGetBoardLines.boardLines()];

	// gather filled lines first
	const { row: filledRows, column: filledCols } = getFilledLines(boardLines);

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

function getFilledLines(boardLines: BoardLine[]): Record<LineType, BoardLine[]> {
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
	return { row: filledRows, column: filledCols };
}

function createRuleViolationFromGroup(
	group: BoardLine[],
	solutionLines: BoardLine[]
): UniqueLinesRuleViolation | null {
	// find the line in the group that is correct according to the solution
	const correctLine = group.find(line => {
		return solutionLines.some(sl => sl.equalsStrict(line))
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

		for (const otherLine of filledLines) {
			if (visitedLines.has(otherLine.lineId)) continue;
			if (line.equalsValues(otherLine)) {
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