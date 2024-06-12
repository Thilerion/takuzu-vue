import { type PuzzleValue, ONE, ZERO, EMPTY } from "../constants.js";
import type { BoardExportString, BoardShape, BoardString, PuzzleGrid } from "../types.js";
import { deducePuzzleDimensions } from "./Board.helpers.js";

const exportStrRegex = /^\d{1,2}x\d{1,2};([.01]){4,}$/;
export const isExportString = (str: string): str is BoardExportString => {
	return exportStrRegex.test(str);
}
export const parseExportString = (str: BoardExportString) => {
	const [dimensions, boardStr] = str.split(';');
	const [width, height] = dimensions.split('x').map(Number);
	return { width, height, boardStr };
}

export const getImportBoardStringData = (
	str: BoardString | BoardExportString,
	dims?: BoardShape
): BoardShape & { boardStr: string } => {
	if (isExportString(str)) {
		return parseExportString(str);
	} else if (dims != null) {
		return {
			...dims,
			boardStr: str
		}
	} else {
		return {
			...deducePuzzleDimensions(str.length),
			boardStr: str
		}
	}
}

export const boardStringToPuzzleGrid = (str: BoardString | BoardExportString, dims?: BoardShape): PuzzleGrid => {
	const { width, height, boardStr } = getImportBoardStringData(str, dims);
	if (boardStr.length < width * height) {
		throw new Error(`Unexpected boardStr size, smaller than board dimensions (str len: ${boardStr.length}, dimensions: ${width}x${height}=${width * height})`);
	}
	const result: PuzzleGrid = [];
	for (let y = 0; y < height; y++) {
		const row: PuzzleValue[] = [];
		for (let x = 0; x < width; x++) {
			const idx = (y * width) + x;
			const rawVal = boardStr[idx];
			if (rawVal === ONE) {
				row.push(ONE);
			} else if (rawVal === ZERO) {
				row.push(ZERO);
			} else row.push(EMPTY);
		}
		result.push(row);
	}
	return result;
}

export const puzzleGridToBoardString = (grid: PuzzleGrid): BoardString => {
	return grid.flat().join('') as BoardString;
}

export const puzzleGridToExportString = (grid: PuzzleGrid, dims?: BoardShape): BoardExportString => {
	const boardStr = puzzleGridToBoardString(grid);
	if (dims == null) {
		const width = grid[0].length;
		const height = grid.length;
		dims = { width, height };
	}
	return `${dims.width}x${dims.height};${boardStr}` as BoardExportString;
}
