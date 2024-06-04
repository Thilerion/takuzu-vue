import { range } from "@/utils/array.ts.utils.js";
import { memoize } from "../utils/memoize.utils.js";
import type { BoardShape, ColumnId, RowId, Vec } from "../types.js";
import { xToColumnId, yToRowId } from "../utils/puzzle-line.utils.js";

/**
 * A map to with rectangular puzzle dimensions associated with an amount of cells in the puzzle.
 * Possible side lengths range from 4-20, and the sides used for a specific amount of cells is the
 * combination that matches a 1.5 aspect ratio the closest.
 * 
 * Used in determining the most likely dimensions of a rectangular puzzle based on the amount of cells,
 * when the dimensions of a puzzle weren't explicitly provided.
 */
const cellsToRectPuzzleDimensions = new Map<number, [w: number, h: number]>([
	[24, [4, 6]],
	[32, [4, 8]],
	[40, [4, 10]],
	[48, [6, 8]],
	[56, [4, 14]],
	[64, [4, 16]],
	[72, [6, 12]],
	[80, [8, 10]],
	[60, [6, 10]],
	[84, [6, 14]],
	[96, [8, 12]],
	[108, [6, 18]],
	[120, [10, 12]],
	[112, [8, 14]],
	[128, [8, 16]],
	[144, [8, 18]],
	[160, [10, 16]],
	[140, [10, 14]],
	[180, [10, 18]],
	[200, [10, 20]],
	[168, [12, 14]],
	[192, [12, 16]],
	[216, [12, 18]],
	[240, [12, 20]],
	[224, [14, 16]],
	[252, [14, 18]],
	[280, [14, 20]],
	[288, [16, 18]],
	[320, [16, 20]],
	[360, [18, 20]]
]);

/**
 * Deduces puzzle dimensions from the provided amount of cells.
 * @param numCells The amount of cells in the puzzle.
 * @returns An object containing the width and height of the puzzle.
 * @throws Error if the correct puzzle size cannot be deduced from the provided length.
 */
export const deducePuzzleDimensions = (numCells: number) => {
	const sqrt = Math.sqrt(numCells);
	if (numCells % 2 === 1 && sqrt % 1 === 0) {
		// Return dimensions for odd-sized square puzzles (NxN)
		return { width: sqrt, height: sqrt };
	}
	if (sqrt % 1 === 0 && sqrt % 2 === 0) {
		// Return dimensions for even-sized square puzzles (NxN)
		return { width: sqrt, height: sqrt };
	}

	// Check if the length corresponds to a valid rectangular puzzle area
	if (cellsToRectPuzzleDimensions.has(numCells)) {
		// Return dimensions for valid rectangular puzzles (NxM)
		const [width, height] = cellsToRectPuzzleDimensions.get(numCells)!;
		return { width, height };
	}
	throw new Error(`Cannot deduce correct puzzle size from this length (${numCells})`);
}

export const generateColumnIds = (width: number): ColumnId[] => {
	// row at idx 0 has lineId: 1, then 2, etc
	return range(width).map((val) => xToColumnId(val));
}
export const generateRowIds = (height: number): RowId[] => {
	// column at idx 0 has lineId: A, then B, then C
	if (height >= 26) {
		throw new Error('Cannot generate column ids for height higher than "Z"');
	}
	return range(height).map(y => yToRowId(y)); // 65 = uppercase A
}

export const generateBoardCoords = memoize(
	(width: number, height: number): ReadonlyArray<Readonly<Vec>> => {
		const cellCoords = [];
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				cellCoords.push({ x, y });
			}
		}
		return cellCoords;
	},
	(width: number, height: number) => `${width},${height}`
)

/**
 * Get the ratio of empty cells in a board.
 * @param board 
 */
export function getMaskRatio(board: BoardShape & { getNumEmpty: () => number }): number {
	const { width, height } = board;
	const numEmpty = board.getNumEmpty();
	const numCells = width * height;
	return numEmpty / numCells;
}