import { generateBoard } from './lib/generation/board';
import { createBasicMaskWithMaxDifficulty } from './lib/generation/mask';

function createPuzzle({ width, height, difficulty = 1 }) {
	let start = performance.now();
	const max = 3000;
	const endAfter = start + max;

	let solution;
	let board;

	while (!solution && performance.now() < endAfter) {
		const result = generateBoard(width, height);
		if (result) solution = result;
	}
	if (!solution) {
		console.warn('Could not generate solution...');
		return;
	}

	while (!board && performance.now() < endAfter) {
		const result = createBasicMaskWithMaxDifficulty(solution, difficulty);
		if (result) board = result;
	}
	if (!board) {
		console.warn('Could not generate mask...');
		return;
	}

	return { solution, board };
}

addEventListener('message', event => {
	const { width, height, difficulty } = event.data.message;
	const result = createPuzzle({ width, height, difficulty });
	if (!result) {
		postMessage({ error: 'could not generate in time...' });
	} else {
		const solution = result.solution.export();
		const board = result.board.export();
		postMessage({ solution, board, error: null });
	}
})