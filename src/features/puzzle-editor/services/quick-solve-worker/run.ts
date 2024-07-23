import type { PuzzleGrid } from "@/lib/types.js";
import type { WorkerInterface } from "@/workers/utils/workerInterface.js";
import { createQuickSolveWorker } from "./quicksolve.interface.js";
import type { QuickSolveWorkerFns } from "./quicksolve.worker.js";

let workerInterface: null | WorkerInterface<QuickSolveWorkerFns> = null;

export const runWorkerQuickSolve = (grid: PuzzleGrid, maxSolutions: number) => {
	if (workerInterface == null) {
		workerInterface = createQuickSolveWorker();
	}
	return workerInterface.request('quicksolve', grid, maxSolutions);
}