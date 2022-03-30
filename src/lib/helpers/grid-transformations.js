import { SimpleBoard } from "../board/Board.js";
import { EMPTY, ONE, ZERO } from "../constants.js";
import { shuffle } from "../utils.js";

const reversed = arr => [...arr].reverse();

export const transpose = (arr) => arr[0].map((_row, i) => arr.map(col => col[i]));

export const vFlip = arr => reversed(arr.map(r => r.slice(0)));
export const hFlip = arr => arr.map(row => reversed(row));
export const rotate90 = arr => transpose(vFlip(arr));
export const rotate180 = arr => reversed(arr).map(row => reversed(row));
export const rotate270 = arr => transpose(hFlip(arr));

export const invertPuzzle = (grid) => {
	return grid.map(row => {
		return row.map(val => {
			if (val === EMPTY) return val;
			else if (val === ZERO) return ONE;
			else if (val === ONE) return ZERO;
			throw new Error(`Unexpected value in grid: "${val}", so cannot invert.`);
		})
	})
}

export function getRandomTransformation({
	board,
	solution
}) {
	const fns = [vFlip, hFlip, rotate180];
	if (board.width === board.height) {
		fns.push(rotate90, rotate270, (arr) => vFlip(rotate90(arr)), (arr) => vFlip(rotate270(arr)));
	}
	const invert = board.width % 2 === 0;

	const invertFn = invert ? invertPuzzle : (grid) => grid;
	const transformFn = fns[Math.floor(Math.random() * fns.length)];

	const boardGrid = invertFn(board.grid);
	const solutionGrid = invertFn(solution.grid);

	return {
		board: new SimpleBoard(transformFn(boardGrid)),
		solution: new SimpleBoard(transformFn(solutionGrid))
	}	
}