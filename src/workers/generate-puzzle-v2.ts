import { WorkerInterface } from "./utils/workerInterface.js";
import type { GenPuzzleWorkerFns } from "./generate-puzzle-v2.worker.js";
import type { BasicPuzzleConfig } from "@/lib/types.js";

const puzzleWorker = new WorkerInterface<GenPuzzleWorkerFns>({
	url: new URL('./generate-puzzle-v2.worker.ts', import.meta.url),
	options: { type: 'module' }
});
export async function generatePuzzle(message: BasicPuzzleConfig) {
	console.log('v2 generating now');
	const result = await puzzleWorker.request('single', message);
	return result;
}
export type GeneratedPuzzleResult = Exclude<Awaited<ReturnType<typeof generatePuzzle>>, undefined>;

export const createNewPuzzleWorker = () => {
	return new WorkerInterface<GenPuzzleWorkerFns>({
		url: new URL('./generate-puzzle-v2.worker.ts', import.meta.url),
		options: { type: 'module' }
	});
}