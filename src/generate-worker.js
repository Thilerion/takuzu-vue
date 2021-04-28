import { generateBoard } from './lib/generation/board';
import { createMaskWithDifficulty, getMaskQuality } from './lib/generation/mask';

function getMinMaskQuality(difficulty = 1) {
	let base = 0.98;

	// adjust based on difficulty; lower difficulty puzzles can not be masked as efficiently
	const maxDiffMod = Math.max(4 - difficulty, 0);
	const difficultyModifier = maxDiffMod * 0.025;
	return base - difficultyModifier;
}

function createPuzzle({ width, height, difficulty = 1 }, forceError = false) {
	if (forceError) {
		return;
	}
	let start = performance.now();
	const max = 3000;
	const endAfter = start + max;

	let solution;
	let board;
	let resultQuality;

	while (!solution && performance.now() < endAfter) {
		const result = generateBoard(width, height);
		if (result) solution = result;
	}
	if (!solution) {
		console.warn('Could not generate solution...');
		return;
	}

	// TODO: improve quality calculation with other modifiers than numMasked
	const minMaskQuality = getMinMaskQuality(difficulty);

	while (!board && performance.now() < endAfter) {
		const result = createMaskWithDifficulty(solution, difficulty);
		// TODO: prevent recalculating optimalRatio etc inside getMaskQuality
		let quality = -1;
		if (result) {
			quality = getMaskQuality(result);
		}

		if (result && quality >= minMaskQuality) {
			board = result;
			resultQuality = quality;
		}
		// TODO: if this fails to often, a different board(solutionBoard) should be picked. Some filled boards just make it very hard to generate a correct mask.
		else if (result) {
			console.error('Mask quality was not good enough...');
			console.log({ board: result, quality, minMaskQuality });
		}
	}
	if (!board) {
		console.warn('Could not generate mask...');
		return;
	}

	return { solution, board, quality: resultQuality, minMaskQuality };
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