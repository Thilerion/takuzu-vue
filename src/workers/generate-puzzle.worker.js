import { createPuzzle } from '@/lib/index.js';
import { createWorkerResult } from './WorkerResult';
const MSG_SOURCE = 'generate-puzzle';

addEventListener('message', event => {
	const { width, height, difficulty } = event.data.message;
	const result = createPuzzle({ width, height, difficulty });

	if (result && result.board) {
		const { solution, board } = result;
		const message = createWorkerResult(true, {
			boardStr: board.export(),
			solutionStr: solution.export(),
			MSG_SOURCE
		});
		postMessage(message);
	} else if (!result) {
		const message = createWorkerResult(false, 'Could not generate puzzle in time.', MSG_SOURCE);
		postMessage(message);
	} else {
		console.warn('Unexpected else statement reached in generatePuzzleWorker');
		console.error({ result });
		postMessage(createWorkerResult(false, "Unexpected else statement reached in generatePuzzleWorker", MSG_SOURCE));
	}
})