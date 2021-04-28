import { EMPTY } from "../constants";
import { maskHasNoSolution, maskHasOneSolution } from "./mask-validation";

export function createMask(board, difficulty = 1) {
	const maskedBoard = board.copy();
	
	for (let { x, y, value } of maskedBoard.cells({ shuffled: true, skipEmpty: true })) {
		maskedBoard.assign(x, y, EMPTY);
		if (!maskHasOneSolution(maskedBoard, difficulty)) {
			// undo removing this as it results in an unsolvable board
			maskedBoard.assign(x, y, value);
		}
	}
	return maskedBoard;
}

export function createMaskWithDifficulty(board, difficulty = 1) {
	const maxAttempts = 5;
	let bestMask;
	for (let i = 0; i < maxAttempts; i++) {
		bestMask = createMask(board, difficulty);
		if (maskHasNoSolution(bestMask, difficulty - 1)) {
			return bestMask;
		}
	}
	console.warn('Mask could not be generated with requested difficulty...');
	return null;
}


// For boards that use harder techniques, achieving a high maskRatio is much easier. So it is better to have a "lower" optimal ratio, and using the difficulty requirement as a better representation of how hard/easy a board is
const optimalMaskedRatios = new Map([
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
const normalizeValue = (value, min, max) => {
	return (value - min) / (max - min);
}


// TODO: on lower difficulties (eg only triples and balance strategy) the optimal ratio is often slightly lower
export function getMaskQuality(board) {
	const { width, height, numEmpty } = board;
	const numCells = width * height;
	const maskRatio = numEmpty / numCells;

	const averageBoardSize = (width + height) / 2;
	const roundedAvgBoardSize = 2 * Math.ceil(averageBoardSize / 2);

	const optimalRatio = optimalMaskedRatios.get(roundedAvgBoardSize) ?? optimalMaskedRatios.get('default');

	// optimalRatio = quality 1 => normalize the quality value to represent this
	const normalizedQuality = normalizeValue(maskRatio, 0, optimalRatio);
	// return 1 if maskRatio is better than the "optimal" ratio
	return Math.min(1, normalizedQuality);
}