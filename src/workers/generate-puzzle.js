import GeneratePuzzleWorker from './generate-puzzle.worker.js?worker';
const puzzleWorker = new GeneratePuzzleWorker();

export function sendWorkerMessage(message) {
	puzzleWorker.postMessage({ message });
}
export function initPuzzleWorkerReceiver() {
	return new Promise((resolve, reject) => {
		puzzleWorker.onmessage = event => {
			const { data } = event;
			console.log('Data from generate-puzzle worker:');
			console.log({ data });
			if (!data.success) reject(data);
			else resolve(data);
		}
	})
}

export async function generatePuzzle(message) {
	const receiver = initPuzzleWorkerReceiver();
	sendWorkerMessage(message);
	const result = await receiver;
	return result;
}