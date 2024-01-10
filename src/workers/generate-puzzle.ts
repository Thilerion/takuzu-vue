import type { BasicPuzzleConfig } from '@/lib/types.js';
import GeneratePuzzleWorker from './generate-puzzle.worker.js?worker';
import type { IWorkerResult } from './WorkerResult';
const puzzleWorker = new GeneratePuzzleWorker();

export type GenPuzzleWorkerMessage = BasicPuzzleConfig;
export type GenPuzzleReqResult = { boardStr: string, solutionStr: string };
export type GenPuzzleWorkerResponse = IWorkerResult<
	GenPuzzleReqResult,
	string
>;

function sendWorkerMessage(message: BasicPuzzleConfig): void {
	puzzleWorker.postMessage({ message });
}
function initPuzzleWorkerReceiver() {
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

export async function generatePuzzle(message: BasicPuzzleConfig): Promise<GenPuzzleWorkerResponse> {
	const receiver = initPuzzleWorkerReceiver();
	sendWorkerMessage(message);
	const result = await receiver;
	return result as GenPuzzleWorkerResponse;
}