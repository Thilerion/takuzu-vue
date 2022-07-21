import { EMPTY, ONE, ZERO } from "../../constants";
import type { GenericTransformFn, PuzzleTransformFn, ROArr, GridTransformationFnName } from "./types";

const reversed = <T>(arr: ROArr<T>): T[] => [...arr].reverse();

export const transpose: GenericTransformFn = (grid) => grid[0].map((_row, i) => grid.map(col => col[i]));

export const vFlip: GenericTransformFn = (grid) => reversed(grid.map(r => r.slice(0)));
export const hFlip: GenericTransformFn = (grid) => grid.map(row => reversed(row));
const rotate90: GenericTransformFn = (grid) => transpose(vFlip(grid));
const rotate180: GenericTransformFn = (grid) => reversed(grid).map(row => reversed(row));
const rotate270: GenericTransformFn = (grid) => transpose(hFlip(grid));

const invertPuzzle: PuzzleTransformFn = (grid) => {
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

// combined
const rotate0 = identifyTransform;
const rotate0_reflect = vFlip;
const rotate90_reflect: GenericTransformFn = (grid) => vFlip(rotate90(grid));
const rotate180_reflect = hFlip;
const rotate270_reflect: GenericTransformFn = (grid) => vFlip(rotate270(grid));

export {
	rotate0, rotate0_reflect,
	rotate90, rotate90_reflect,
	rotate180, rotate180_reflect,
	rotate270, rotate270_reflect,

	invertPuzzle
}

export const transformationFnMap: Record<GridTransformationFnName, GenericTransformFn> = {
	rotate0, rotate0_reflect,
	rotate90, rotate90_reflect,
	rotate180, rotate180_reflect,
	rotate270, rotate270_reflect,
}