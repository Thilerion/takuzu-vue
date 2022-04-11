import { generateBoard } from "./board.js";
import { createMaskWithDifficulty } from "./mask.js";
import { getOptimalMaskRatio, getMaskQuality } from "./quality.js";

const minMaskedRatioQuality = 0.94;
const minSymbolDistributionQuality = 0.36;

const _tryDurations = [250, 1000, 1750, 2000];
const _totalMaxDuration = _tryDurations.reduce((acc, val) => acc + val, 0);
const _maxTries = 20;


/**
 * 
 * @param {Object} puzzleConfig 
 * @param {number} puzzleConfig.width
 * @param {number} puzzleConfig.height
 * @param {1|2|3|4|5} puzzleConfig.difficulty
 */
export function createPuzzle(puzzleConfig, opts = {}) {
	const { width, height, difficulty } = puzzleConfig;
	const {
		maxTries = 20,
		totalMaxDuration = 5000,
		tryDurations = [250, 1000, 1750, 2000]
	} = opts;

	const start = performance.now();
	const end = start + totalMaxDuration;
	const shouldEnd = () => performance.now() >= end;

	const optimalMaskedRatio = getOptimalMaskRatio(width, height, difficulty);

	for (let i = 0; i < maxTries; i++) {
		if (shouldEnd()) break;
		let maxTime = 3000;
		if (i < tryDurations.length) {
			maxTime = tryDurations[i];
		}
		const genResult = createBoardAndMaskOnce({ optimalMaskedRatio, width, height, difficulty }, maxTime);
		const { success, error } = genResult;

		if (success) {
			const { solution, board, quality } = genResult;
			return { solution, board, quality };
		} else if (error) {
			// console.warn(`Puzzle generation, try [${i}/${maxTries}]: ${error}`);
		}
	}
	console.warn('Timeout reached generating puzzle.');
	return;
}

/**
 * 
 * @param {Object} opts
 * @param {number} opts.width 
 * @param {number} opts.height 
 * @param {number} opts.optimalMaskedRatio
 * @param {1|2|3|4|5} opts.difficulty
 * @param {number} maxTime 
 */
function createBoardAndMaskOnce(opts, maxTime = 1000) {
	const { width, height, difficulty, optimalMaskedRatio } = opts;
	const start = performance.now();
	const timeoutAfter = start + maxTime;

	const timeoutReached = () => performance.now() > timeoutAfter;

	const data = { solution: null, board: null, quality: null };

	while (!data.solution && !timeoutReached()) {
		const result = generateBoard(width, height);
		if (result) data.solution = result;
	}

	if (!data.solution) {
		return { error: 'Solution generation timeout reached.' };
	}

	while (!data.board && !timeoutReached()) {
		const maskResult = createMaskWithDifficulty(data.solution, difficulty);

		if (!maskResult) continue;

		const quality = getMaskQuality(maskResult, optimalMaskedRatio);
		if (maskResult && quality.maskedRatio >= minMaskedRatioQuality && quality.symbolDistribution >= minSymbolDistributionQuality) {
			data.board = maskResult;
			data.quality = quality;
		} else if (maskResult) {
			// console.warn('Generated mask quality was not good enough.');
			// console.log({ board: maskResult, quality, minMaskedRatioQuality, minSymbolDistributionQuality });
		}
	}

	if (!data.board) {
		return { error: 'Mask/board generation timeout reached. Maybe retry with another solutionBoard.' };
	} else {
		return { ...data, success: true };
	}
}