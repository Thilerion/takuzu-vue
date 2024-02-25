import { WorkerInterface, type WorkerInterfaceOpts } from "../utils/workerInterface.js";
import type { GenPuzzleWorkerFns, GeneratedPuzzleResult } from "./worker.js";
import type { BasicPuzzleConfig } from "@/lib/types.js";

let _worker: null | Worker = null;
const createWorker = () => {
	_worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
	return _worker;
}

const createGenPuzzleWorker = (opts: WorkerInterfaceOpts = {}): WorkerInterface<GenPuzzleWorkerFns> => {
	const mergedOpts: WorkerInterfaceOpts = {
		autoStart: true,
		startOnInitialization: false,
		...opts,
	}
	return new WorkerInterface<GenPuzzleWorkerFns>(createWorker, mergedOpts);
}
const puzzleWorker = createGenPuzzleWorker();

// To be used by the main thread, for requesting a puzzle when the user clicks "New Puzzle"
export function generatePuzzle(message: BasicPuzzleConfig): Promise<GeneratedPuzzleResult> {
	return puzzleWorker.request('single', message);
}