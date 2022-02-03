import GeneratePuzzleWorker from './generate-puzzle.worker.js?worker';
const puzzleWorker = new GeneratePuzzleWorker();

export function sendWorkerMessage(message) {
	puzzleWorker.postMessage({ message });
}
export function initPuzzleWorkerReceiver() {
	return new Promise((resolve, reject) => {
		puzzleWorker.onmessage = event => {
			const { data } = event;
			if (data.error) reject(data.error);
			else resolve(data);
		}
	})
}