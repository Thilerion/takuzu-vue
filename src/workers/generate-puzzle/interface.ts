import { WorkerInterface, type WorkerInterfaceOpts } from "../utils/workerInterface.js";
import type { GenPuzzleWorkerFns } from "./generate.worker.js";

export const createGenPuzzleWorker = (opts: WorkerInterfaceOpts = {}): WorkerInterface<GenPuzzleWorkerFns> => {
	let _worker: null | Worker = null;

	const createWorker = () => {
		_worker = new Worker(new URL('./generate.worker.ts', import.meta.url), { type: 'module' });
		return _worker;
	}

	const mergedOpts: WorkerInterfaceOpts = {
		autoStart: true,
		startOnInitialization: false,
		...opts,
	}
	return new WorkerInterface<GenPuzzleWorkerFns>(createWorker, mergedOpts);
}