const puzzleWorker = new Worker('./generate-puzzle.worker.js', { type: 'module' });

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