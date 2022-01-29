import { createPuzzle } from '@/lib/index.js';

addEventListener('message', event => {
	const { width, height, difficulty } = event.data.message;
	const result = createPuzzle({ width, height, difficulty });

	if (!result) {
		postMessage({ error: 'could not generate in time...' });
	} else {
		const solution = result.solution.export();
		const board = result.board.export();
		const { quality } = result;
		console.log({ board, quality });
		postMessage({ solution, board, error: null });
	}
})