import { ONE, ZERO } from "../constants";
import { countValuesInMap } from "../utils";

// empirically found mask ratios, puzzles can be generated in a reasonable amount of time with this ratio of masked/unmasked cells
const optimalMaskRatios = new Map([
	[18, 0.72],
	[16, 0.73],
	[14, 0.75],
	[12, 0.77],
	[10, 0.81],
	[8, 0.8125],
	[6, 0.80556],
	[4, 0.6875],
	['default', 0.6875],
]);

// for puzzles with a lower difficulty (eg only doubles and line balance),
//  it is harder to mask a lot of cells
const maskRatioDifficultyModifiers = [
	0.94, 0.96, 0.98, 1, 1
];

export function getOptimalMaskRatio(width, height, difficulty) {
	const avgBoardSize = (width + height) / 2;
	const roundedAvgBoardSize = 2 * Math.ceil(avgBoardSize / 2);

	const sizeRatio = optimalMaskRatios.get(roundedAvgBoardSize) ?? optimalMaskRatios.get('default');
	const difficultyMod = maskRatioDifficultyModifiers[difficulty] ?? 1;

	const optimalRatio = sizeRatio * difficultyMod;
	return optimalRatio;
}

function normalizeValue(value, min = 0, max = 1) {
	return (value - min) / (max - min);
}

export function getMaskedRatioQuality(board, optimalRatio) {
	const { width, height, numEmpty } = board;
	const numCells = width * height;
	const maskRatio = numEmpty / numCells;

	// optimalRatio = quality 1 => normalize the quality value to represent this
	const normalized = normalizeValue(maskRatio, 0, optimalRatio);
	// return 1 if maskRatio is better than the "optimal" ratio
	return Math.min(1, normalized);
}

// a puzzle wherein one symbol is largely masked and the other largely unmasked
//  is less fun, and possibly too easy
export function getSymbolDistributionQuality(board) {
	const symbolCounts = countValuesInMap([...board.grid].flat());
	const countZero = symbolCounts.get(ZERO);
	const countOne = symbolCounts.get(ONE);
	const numFilled = countZero + countOne;

	const symbolRatioZero = countZero / numFilled;
	const symbolRatioOne = countOne / numFilled;
	
	const symbolRatio = Math.min(symbolRatioOne, symbolRatioZero);

	// best if ratio higher than 0.35 (and lower than 0.65 for the other)
	const normalizedSymbolRatio = normalizeValue(symbolRatio, 0, 0.5);
	return normalizedSymbolRatio;
}

export function getMaskQuality(board, optimalMaskedRatio) {
	const maskedRatioQuality = getMaskedRatioQuality(board, optimalMaskedRatio);
	const symbolDistributionQuality = getSymbolDistributionQuality(board);

	return {
		maskedRatio: maskedRatioQuality,
		symbolDistribution: symbolDistributionQuality
	};
}