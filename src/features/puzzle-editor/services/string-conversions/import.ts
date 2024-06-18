import { boardStringToPuzzleGrid, getImportBoardStringData, isExportString } from "@/lib/board/board-conversion.helpers.js";
import type { PuzzleGrid } from "@/lib/types.js"
import { isValidBoardString } from "@/lib/utils/puzzle-line.utils.js";
import { customPuzzleStringLongToGrid, isCustomPuzzleStringLong } from "./custom-long.js";
import { isPotentialCustomPuzzleStringRleWithDims, decodeCustomPuzzleStringRleWithDims } from "./custom-rle.js";

export type InferredCustomPuzzleStringType = 'BoardString' | 'BoardExportString' | 'CustomLong' | 'CustomRLE';
export type ParsedCustomPuzzleString = {
	success: true,
	width: number,
	height: number,
	grid: PuzzleGrid,
	type: InferredCustomPuzzleStringType
}
export type CustomPuzzleStringParserError = {
	success: false,
	error: 'Generic: Invalid string' | 'RLE error', // TODO: better error type
}

export function importCustomPuzzleString(str: string): ParsedCustomPuzzleString | CustomPuzzleStringParserError {
	const _isExportString = isExportString(str);
	const _isBoardString = !_isExportString && isValidBoardString(str);

	if (_isExportString || _isBoardString) {
		const { width, height, boardStr } = getImportBoardStringData(str);
		const grid = boardStringToPuzzleGrid(boardStr, { width, height });
		const type = _isExportString ? 'BoardExportString' : 'BoardString';
		return { success: true, width, height, grid, type };
	}

	if (isCustomPuzzleStringLong(str)) {
		const grid = customPuzzleStringLongToGrid(str);
		const width = grid[0].length;
		const height = grid.length;
		const type = 'CustomLong';
		return { success: true, width, height, grid, type };
	}

	if (isPotentialCustomPuzzleStringRleWithDims(str)) {
		try {
			const { board: boardString, dimensions } = decodeCustomPuzzleStringRleWithDims(str);
			if (!isValidBoardString(boardString)) {
				throw new Error('Decoded string is not a valid board string');
			}
			const grid = boardStringToPuzzleGrid(boardString, dimensions);
			const { width, height } = dimensions;
			const type = 'CustomRLE';
			return { success: true, width, height, grid, type };
		} catch(e) {
			console.warn(e);
			return { success: false, error: 'RLE error'};
		}
	}
	return { success: false, error: 'Generic: Invalid string' };
}