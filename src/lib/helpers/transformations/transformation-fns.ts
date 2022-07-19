import { EMPTY, ONE, ZERO } from "../../constants";
import type { GenericTransformFn, PuzzleTransformFn, ROArr } from "./types";

const reversed = <T>(arr: ROArr<T>): T[] => [...arr].reverse();

export const transpose: GenericTransformFn = (grid) => grid[0].map((_row, i) => grid.map(col => col[i]));

export const vFlip: GenericTransformFn = (grid) => reversed(grid.map(r => r.slice(0)));
export const hFlip: GenericTransformFn = (grid) => grid.map(row => reversed(row));
export const rotate90: GenericTransformFn = (grid) => transpose(vFlip(grid));
export const rotate180: GenericTransformFn = (grid) => reversed(grid).map(row => reversed(row));
export const rotate270: GenericTransformFn = (grid) => transpose(hFlip(grid));

export const invertPuzzle: PuzzleTransformFn = (grid) => {
	return grid.map(row => {
		return row.map((val) => {
			if (val === EMPTY) return val;
			else if (val === ZERO) return ONE;
			else if (val === ONE) return ZERO;
			throw new Error(`Unexpected value in grid: "${val}", so cannot invert.`);
		})
	})
}
export const identifyTransform: GenericTransformFn = (grid) => {
	return grid.map(row => [...row]);
}