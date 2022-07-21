import type { SimpleBoard } from "../board/Board";

export type BoardShapeType = 'square' | 'rect' | 'odd';

const isOdd = (val: number) => val % 2 === 1;
const isSquareBoard = (board: SimpleBoard) => board.width === board.height;

export const getBoardShapeType = (board: SimpleBoard): BoardShapeType => {
	const { width, height } = board;
	if (isSquareBoard(board)) {
		if (isOdd(width)) return 'odd';
		return 'square';
	} else {
		if (!isOdd(width) && !isOdd(height)) return 'rect';
	}
	throw new Error(`Unknown board shape type for width x height of: ${width} x ${height}`);
}