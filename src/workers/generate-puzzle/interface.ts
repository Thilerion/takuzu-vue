import { WorkerInterface, type WorkerInterfaceOpts } from "../utils/workerInterface.js";
import type { GenPuzzleWorkerFns, GeneratedPuzzleResult } from "./worker.js";
import type { BasicPuzzleConfig } from "@/lib/types.js";

const createGenPuzzleWorker = (opts: WorkerInterfaceOpts = {}): WorkerInterface<GenPuzzleWorkerFns> => {
	const mergedOpts: WorkerInterfaceOpts = {
		autoStart: true,
		startOnInitialization: false,
		...opts,
	}
	return new WorkerInterface<GenPuzzleWorkerFns>({
		url: new URL('./worker.ts', import.meta.url),
		options: { type: 'module' }
	}, mergedOpts);
}

const puzzleWorker = createGenPuzzleWorker();

// To be used by the main thread, for requesting a puzzle when the user clicks "New Puzzle"
export function generatePuzzle(message: BasicPuzzleConfig): Promise<GeneratedPuzzleResult> {
	return puzzleWorker.request('single', message);
}

// To be used only by the "pregen" worker, for creating puzzles in bulk
export const createNewPuzzleWorker = () => createGenPuzzleWorker();