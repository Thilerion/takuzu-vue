import { identity } from "@/utils/function.utils";
import { SimpleBoard } from "../board/Board";
import { EMPTY, ONE, ZERO, type PuzzleValue } from "../constants";

type ROArr<T> = ReadonlyArray<T>;
type Grid<T> = T[][];
type ROGrid<T> = ReadonlyArray<ReadonlyArray<T>>;

const reversed = <T>(arr: ROArr<T>): T[] => [...arr].reverse();

export const transpose = <T>(grid: ROGrid<T>): T[][] => grid[0].map((_row, i) => grid.map(col => col[i]));

export const vFlip = <T>(grid: ROGrid<T>): Grid<T> => reversed(grid.map(r => r.slice(0)));
export const hFlip = <T>(grid: ROGrid<T>): Grid<T> => grid.map(row => reversed(row));
export const rotate90 = <T>(grid: ROGrid<T>): Grid<T> => transpose(vFlip(grid));
export const rotate180 = <T>(grid: ROGrid<T>): Grid<T> => reversed(grid).map(row => reversed(row));
export const rotate270 = <T>(grid: ROGrid<T>): Grid<T> => transpose(hFlip(grid));

export const invertPuzzle = (grid: ROGrid<PuzzleValue>): Grid<PuzzleValue> => {
	return grid.map(row => {
		return row.map((val) => {
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
}: { board: SimpleBoard, solution: SimpleBoard }) {
	const fns = [vFlip, hFlip, rotate180];
	if (board.width === board.height) {
		fns.push(rotate90, rotate270, (arr) => vFlip(rotate90(arr)), (arr) => vFlip(rotate270(arr)));
	}
	const invert = board.width % 2 === 0;

	const invertFn = invert ? invertPuzzle : identity;
	const transformFn = fns[Math.floor(Math.random() * fns.length)];

	const boardGrid = invertFn(board.grid);
	const solutionGrid = invertFn(solution.grid);

	return {
		board: new SimpleBoard(transformFn(boardGrid)),
		solution: new SimpleBoard(transformFn(solutionGrid))
	}
}