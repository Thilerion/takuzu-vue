import { createPuzzle } from '@/lib/index.js';
import { createWorkerResult } from './WorkerResult.js';

const createMessage = createWorkerResult('generate-puzzle');

addEventListener('message', event => {
	const { width, height, difficulty } = event.data.message;
	const result = createPuzzle({ width, height, difficulty });

	if (result && result.board) {
		const { solution, board } = result;
		const message = createMessage(true, {
			boardStr: board.export(),
			solutionStr: solution.export()
		});
		postMessage(message);
	} else if (!result) {
		const message = createMessage(false, 'Could not generate puzzle in time.');
		postMessage(message);
	} else {
		console.warn('Unexpected else statement reached in generatePuzzleWorker');
		console.error({ result });
		postMessage(createMessage(false, "Unexpected else statement reached in generatePuzzleWorker"));
	}
})