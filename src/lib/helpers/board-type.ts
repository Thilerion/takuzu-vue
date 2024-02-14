import type { SimpleBoard } from "../board/Board";
import type { PuzzleValue } from "../constants.js";

export type BoardShapeType = 'square' | 'rect' | 'odd';

const isOdd = (val: number) => val % 2 === 1;

const boardShapeTypeFromDimensions = (width: number, height: number): BoardShapeType => {
	if (width === height) {
		if (isOdd(width)) return 'odd';
		return 'square';
	} else {
		if (!isOdd(width) && !isOdd(height)) return 'rect';
	}
	throw new Error(`Unknown board shape type for width x height of: ${width} x ${height}`);
}

export const getBoardShapeType = (board: SimpleBoard): BoardShapeType => {
	const { width, height } = board;
	return boardShapeTypeFromDimensions(width, height);
}

export const getBoardShapeTypeFromGrid = (
	grid: ReadonlyArray<ReadonlyArray<PuzzleValue>>
): BoardShapeType => {
	const width = grid[0].length;
	const height = grid.length;
	return boardShapeTypeFromDimensions(width, height);
}