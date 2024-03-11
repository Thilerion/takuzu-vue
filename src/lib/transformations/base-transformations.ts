import { EMPTY } from "../constants.js"
import type { PuzzleGrid } from "../types.js";
import { getOppositeSymbol } from "../utils.js";
import type { ReadonlyGrid, TransformationFn, BaseTransformationConfig } from "./types.js";

const invertSymbols = (grid: ReadonlyGrid): PuzzleGrid => {
	return grid.map(row => {
		return row.map((val) => {
			return val === EMPTY ? EMPTY : getOppositeSymbol(val);
		})
	})
}

const reversed = <T>(arr: ReadonlyArray<T>): T[] => [...arr].reverse();
const transpose = (grid: PuzzleGrid): PuzzleGrid => grid[0].map((_row, i) => grid.map(col => col[i]));
const identifyTransform = (grid: ReadonlyGrid): PuzzleGrid => grid.map(row => [...row]); // performs a 2d copy of the grid

const vFlip = (grid: ReadonlyGrid): PuzzleGrid => reversed(grid.map(r => r.slice(0)));
const hFlip = (grid: ReadonlyGrid): PuzzleGrid => grid.map(row => reversed(row));

const rotate90 = (grid: ReadonlyGrid): PuzzleGrid => transpose(vFlip(grid));
const rotate180 = (grid: ReadonlyGrid): PuzzleGrid => reversed(grid).map(row => reversed(row));
const rotate270 = (grid: ReadonlyGrid): PuzzleGrid => transpose(hFlip(grid));

export const createCombinedTransformationFn = (transforms: BaseTransformationConfig): TransformationFn => {
	const fns: TransformationFn[] = [];
	
	const [rot, flip, invert] = transforms;

	switch(rot) {
		case 'rot0': break;
		case 'rot90': fns.push(rotate90); break;
		case 'rot180': fns.push(rotate180); break;
		case 'rot270': fns.push(rotate270); break;
		default: {
			const _exhaustiveCheck: never = rot;
			throw new Error(`Unexpected rotation: ${_exhaustiveCheck}`);
		}
	}

	switch(flip) {
		case 'noFlip': break;
		case 'flip': fns.push(vFlip); break;
		default: {
			const _exhaustiveCheck: never = flip;
			throw new Error(`Unexpected flip: ${_exhaustiveCheck}`);
		}
	}

	switch(invert) {
		case 'noInvert': break;
		case 'invertSymbols': fns.push(invertSymbols); break;
		default: {
			const _exhaustiveCheck: never = invert;
			throw new Error(`Unexpected invert: ${_exhaustiveCheck}`);
		}
	}

	if (fns.length === 0) return identifyTransform;
	else if (fns.length === 1) return fns[0];

	const resultFn = ((grid: ReadonlyGrid) => {
		return fns.reduce((acc, fn) => fn(acc), grid);
	}) as TransformationFn;

	return resultFn;
}