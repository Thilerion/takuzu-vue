import { boardStringToPuzzleGrid } from "@/lib/board/board-conversion.helpers.js";
import type { PuzzleValue } from "@/lib/constants.js";
import type { BoardShape, BoardString, PuzzleGrid } from "@/lib/types.js";

export function gridToCustomPuzzleStringLong(
	grid: PuzzleGrid
): string {
	// Join each row simply, and join the rows with a space
	return grid.map((row) => row.join('')).join(' ');
}

export function customPuzzleStringLongToGrid(
	str: string
): PuzzleGrid {
	return str.split(' ').map(row => row.split('') as PuzzleValue[]);
}

export function boardStringToCustomPuzzleStringLong(
	str: BoardString,
	dimensions: BoardShape
): string {
	const puzzleGrid = boardStringToPuzzleGrid(str, dimensions);
	const res = gridToCustomPuzzleStringLong(puzzleGrid);
	return res;
}