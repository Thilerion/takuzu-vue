import { type WorkerInterfaceOpts, WorkerInterface } from "@/workers/utils/workerInterface.js";
import type { QuickSolveWorkerFns } from "./quicksolve.worker.js";

export const createQuickSolveWorker = (opts: WorkerInterfaceOpts = {}): WorkerInterface<QuickSolveWorkerFns> => {
	let _worker: null | Worker = null;

	const createWorker = () => {
		_worker = new Worker(new URL('./quicksolve.worker.ts', import.meta.url), { type: 'module' });
		return _worker;
	}

	const mergedOpts: WorkerInterfaceOpts = {
		autoStart: true,
		startOnInitialization: false,
		...opts,
	}
	return new WorkerInterface<QuickSolveWorkerFns>(createWorker, mergedOpts);
}