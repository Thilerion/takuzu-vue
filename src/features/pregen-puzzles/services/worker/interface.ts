import type { BasicPuzzleConfig } from "@/lib/types.js";
import { WorkerInterface, type WorkerInterfaceOpts } from "@/workers/utils/workerInterface.js";
import type { PregenPuzzlesWorkerFns } from "./pregen.worker.js";
import type { GeneratedPuzzle } from "../db/models.js";

let _worker: null | Worker = null;
const createWorker = () => {
	if (_worker != null) return _worker;
	_worker = new Worker(new URL('./pregen.worker.ts', import.meta.url), { type: 'module' });
	return _worker;
}

const createPregenPuzzlesWorker = (opts: WorkerInterfaceOpts = {}): WorkerInterface<PregenPuzzlesWorkerFns> => {
	const mergedOpts: WorkerInterfaceOpts = {
		autoStart: true,
		startOnInitialization: false,
		...opts,
	}
	return new WorkerInterface<PregenPuzzlesWorkerFns>(createWorker, mergedOpts);
}
const pregenWorker = createPregenPuzzlesWorker();

export async function initPregenPuzzles(): Promise<{ generated: number, done: boolean, pending: false }> {
	const result = await pregenWorker.requestDeduplicated('pregen');
	if (result.done) {
		if (result.generated > 0) {
			console.log('Pregen was successful. Amount generated:', result.generated);
		}
		return { ...result, pending: false as const };
	} else {
		console.warn('Pregen has not succesfully finished generating all required puzzles. Amount generated:', result.generated);
		return { ...result, pending: false as const };
	}
}

export async function initializeOrPopulatePregenPuzzles(): Promise<{ done: boolean, generated: number, populated?: boolean }> {
	return await pregenWorker.requestDeduplicated('initialize');
}

export async function clearPregenPuzzlesDb(): Promise<boolean> {
	return await pregenWorker.requestDeduplicated('clearDb');
}
export function retrievePregenPuzzleFromDb(conf: BasicPuzzleConfig): Promise<GeneratedPuzzle | null> {
	return pregenWorker.request('retrieveFromDb', conf);
}