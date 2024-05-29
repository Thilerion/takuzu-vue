import { arrayCountValuesAsMap } from "@/utils/array.ts.utils";
import type { SimpleBoard } from "../board/Board";
import { ONE, ZERO } from "../constants";
import type { DifficultyKey, DimensionStr } from "../types";

// empirically found mask ratios, puzzles can be generated in a reasonable amount of time with this ratio of masked/unmasked cells
const defaultMaskRatio = 0.6875;
const optimalMaskRatios = new Map<number | 'default', number>([
	[18, 0.72],
	[16, 0.73],
	[14, 0.75],
	[12, 0.77],
	[10, 0.81],
	[8, 0.8125],
	[6, 0.80556],
	[4, 0.6875],
	['default', defaultMaskRatio],
]);

const maskRatioTargets = new Map<DimensionStr | 'default', { min: number, optimal: number }>([
	['default', { min: 0.70, optimal: 0.78 }],

	['4x4', { min: 0.65, optimal: 0.6875 }],
	['6x6', { min: 0.72, optimal: 0.81 }],
	['8x8', { min: 0.72, optimal: 0.81 }],
	['10x10', { min: 0.72, optimal: 0.81 }],
	['12x12', { min: 0.72, optimal: 0.76 }],
	['14x14', { min: 0.72, optimal: 0.75 }],
	['16x16', { min: 0.72, optimal: 0.74 }],

	['5x5', { min: 0.68, optimal: 0.72 }],
	['7x7', { min: 0.72, optimal: 0.81 }],
	['9x9', { min: 0.72, optimal: 0.81 }],
	['11x11', { min: 0.72, optimal: 0.75 }],
	['13x13', { min: 0.72, optimal: 0.74 }],

	['6x10', { min: 0.72, optimal: 0.81 }],
	['8x12', { min: 0.72, optimal: 0.81 }],
	['10x14', { min: 0.72, optimal: 0.79 }],
	['12x16', { min: 0.72, optimal: 0.78 }],

])

// for puzzles with a lower difficulty (eg only doubles and line balance),
//  it is harder to mask a lot of cells
const maskRatioDifficultyModifiers: Record<DifficultyKey, number> = {
	1: 0.97,
	2: 0.98,
	3: 0.97,
	4: 1,
	5: 1
};

export function getOptimalMaskRatio(width: number, height: number, difficulty: DifficultyKey): number {
	const avgBoardSize = (width + height) / 2;
	const roundedAvgBoardSize = 2 * Math.ceil(avgBoardSize / 2);

	const sizeRatio: number = optimalMaskRatios.get(roundedAvgBoardSize) ?? optimalMaskRatios.get('default')!;
	const difficultyMod = maskRatioDifficultyModifiers[difficulty] ?? 1;

	const optimalRatio = sizeRatio * difficultyMod;
	return optimalRatio;
}
export function getMinMaskRatio(width: number, height: number/* , difficulty: DifficultyKey */): number {
	const key = `${width}x${height}` as DimensionStr;
	const { min } = maskRatioTargets.get(key) ?? maskRatioTargets.get('default')!;
	return min;
}

function normalizeValue(value: number, min = 0, max = 1) {
	return (value - min) / (max - min);
}

function getMaskedRatioQuality(board: SimpleBoard, optimalRatio: number): number {
	const { width, height } = board;
	const numEmpty = board.getNumEmpty();
	const numCells = width * height;
	const maskRatio = numEmpty / numCells;

	// optimalRatio = quality 1 => normalize the quality value to represent this
	const normalized = normalizeValue(maskRatio, 0, optimalRatio);
	// return 1 if maskRatio is better than the "optimal" ratio
	return Math.min(1, normalized);
}

// a puzzle wherein one symbol is largely masked and the other largely unmasked
//  is less fun, and possibly too easy
function getSymbolDistributionQuality(board: SimpleBoard): number {
	const symbolCounts = arrayCountValuesAsMap([...board.grid].flat());
	const countZero = symbolCounts.get(ZERO)!;
	const countOne = symbolCounts.get(ONE)!;
	const numFilled = countZero + countOne;

	const symbolRatioZero = countZero / numFilled;
	const symbolRatioOne = countOne / numFilled;
	
	const symbolRatio = Math.min(symbolRatioOne, symbolRatioZero);

	// best if ratio higher than 0.35 (and lower than 0.65 for the other)
	const normalizedSymbolRatio = normalizeValue(symbolRatio, 0, 0.5);
	return normalizedSymbolRatio;
}

export function getMaskQuality(board: SimpleBoard, optimalMaskedRatio: number): { maskedRatio: number; symbolDistribution: number; } {
	const maskedRatioQuality = getMaskedRatioQuality(board, optimalMaskedRatio);
	const symbolDistributionQuality = getSymbolDistributionQuality(board);

	return {
		maskedRatio: maskedRatioQuality,
		symbolDistribution: symbolDistributionQuality
	};
}