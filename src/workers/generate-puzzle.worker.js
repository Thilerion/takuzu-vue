import { generateBoard } from '@/lib/generation/board';
import { createMaskWithDifficulty } from '@/lib/generation/mask';
import { getOptimalMaskRatio, getMaskQuality } from '@/lib/generation/quality';

const minMaskedRatioQuality = 0.94;
const minSymbolDistributionQuality = 0.6;

const tryDurations = [250, 1000, 1750, 2000];
const totalMaxDuration = tryDurations.reduce((acc, val) => acc + val, 0);
const maxTries = 20;

function createPuzzle(puzzleConfig = {}) {
	const { width, height, difficulty } = puzzleConfig;

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
			console.warn(`Puzzle generation, try [${i}/${maxTries}]: ${error}`);
		}
	}
	console.warn('Timeout reached generating puzzle.');
	return;
}

function createBoardAndMaskOnce({ width, height, difficulty, optimalMaskedRatio }, maxTime = 1000) {
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
			console.warn('Generated mask quality was not good enough.');
			console.log({ board: maskResult, quality, minMaskedRatioQuality, minSymbolDistributionQuality });
		}
	}

	if (!data.board) {
		return { error: 'Mask/board generation timeout reached. Maybe retry with another solutionBoard.' };
	} else {
		return { ...data, success: true };
	}
}

addEventListener('message', event => {
	const { width, height, difficulty } = event.data.message;
	const result = createPuzzle({ width, height, difficulty });

	if (!result) {
		postMessage({ error: 'could not generate in time...' });
	} else {
		const solution = result.solution.export();
		const board = result.board.export();
		const { quality, minMaskedRatioQuality } = result;
		console.log({ board, quality, minMaskedRatioQuality });
		postMessage({ solution, board, error: null });
	}
})