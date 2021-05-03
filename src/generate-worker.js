import { generateBoard } from './lib/generation/board';
import { createMaskWithDifficulty } from './lib/generation/mask';
import { getOptimalMaskRatio, getMaskQuality } from './lib/generation/quality';

const minMaskedRatioQuality = 0.94;
const minSymbolDistributionQuality = 0.6;

function createPuzzle({ width, height, difficulty = 1 }, forceError = false) {
	if (forceError) {
		return;
	}

	const tryDurations = [750, 1250, 1750, 2500];

	// TODO: improve quality calculation with other modifiers than numMasked and distribution
	const optimalMaskedRatio = getOptimalMaskRatio(width, height, difficulty);

	for (let currentTry = 0; currentTry < 4; currentTry++) {
		const maxTime = tryDurations[currentTry];
		const generationResult = createBoardAndMaskOnce({ width, height, difficulty, optimalMaskedRatio }, maxTime);

		if (generationResult.success) {
			const { solution, board, quality } = generationResult;
			return { solution, board, quality };
		}
		if (generationResult.error) {
			console.warn(`Puzzle generation, try [${currentTry}/4]: ${generationResult.error}`);
		}
	}

	console.warn('After 4 tries generating boards and masks: timeout reached.');
	return;
}

function createBoardAndMaskOnce({width, height, difficulty = 1, optimalMaskedRatio}, maxTime = 1000) {
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
	const { forceError } = event.data;
	const result = createPuzzle({ width, height, difficulty }, forceError);

	if (!result) {
		postMessage({ error: 'could not generate in time...' });
	} else {
		const solution = result.solution.export();
		const board = result.board.export();
		const { quality, minMaskQuality } = result;
		console.log({ board, quality, minMaskQuality });
		postMessage({ solution, board, error: null });
	}
})