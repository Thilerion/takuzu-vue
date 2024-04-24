import { range } from "@/utils/array.ts.utils.js";
import { memoize } from "../memoize.utils.js";
import type { ColumnId, RowId } from "../types.js";
import { xToColumnId, yToRowId } from "../utils/puzzle-line.utils.js";

const validPuzzleSideLengths = [4, 6, 8, 10, 12, 14, 16, 18, 20] as const;
function getValidRectPuzzleDimensions() {
	const result = new Map<number, [w: number, h: number]>();
	for (let i = 0; i < validPuzzleSideLengths.length - 1; i++) {
		for (let j = i + 1; j < validPuzzleSideLengths.length; j++) {
			const w = validPuzzleSideLengths[i];
			const h = validPuzzleSideLengths[j];
			const length = w * h;
			if (result.has(length)) {
				const [w2, h2] = result.get(length)!;
				const bestAspectRatio = 1.5;
				const aspectRatioCurrent = h2 / w2;
				const aspectRatioNew = h / w;
				const diffA = Math.abs(bestAspectRatio - aspectRatioCurrent);
				const diffB = Math.abs(bestAspectRatio - aspectRatioNew);
				if (diffB < diffA) {
					result.set(length, [w, h]);
				}
			} else {
				result.set(length, [w, h]);
			}			
		}
	}
	return result;
}
const puzzleSizeMap = getValidRectPuzzleDimensions();
export const deducePuzzleDimensionsFromLength = (length: number) => {
	const sqrt = Math.sqrt(length);
	if (length % 2 === 1 && sqrt % 1 === 0) {
		// odd NxN
		return { width: sqrt, height: sqrt };
	}
	if (sqrt % 1 === 0 && sqrt % 2 === 0) {
		// square NxN
		return { width: sqrt, height: sqrt };
	}

	// rect NxM
	if (puzzleSizeMap.has(length)) {
		const [width, height] = puzzleSizeMap.get(length)!;
		return { width, height };
	}

	throw new Error(`Cannot deduce correct puzzle size from this length (${length})`);
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

export const getCoordsForBoardSize = memoize(
	(width: number, height: number) => {
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