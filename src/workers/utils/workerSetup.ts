import type { BaseWorkerFunctionMap, WorkerRequest, WorkerResponse } from './types.js';

/*
Example usage in a test-worker.worker.ts file:

import { setupWorker } from '@/utils-lib/workers/workerSetup.js';
import type { BaseWorkerFunctionMap } from '@/utils-lib/workers/types.js';

const funcs = {
	count: (a: number, b: number) => a + b,
	concat: (a: string, b?: string) => b == null ? a : a + b,
} satisfies BaseWorkerFunctionMap;
export type TestFnMap = typeof funcs;

setupWorker(funcs);
*/

const worker: Worker = self as unknown as Worker;

function postWorkerResponse<T>(data: WorkerResponse<T>) {
    worker.postMessage(data);
}
function isWorkerRequest(data: unknown): data is WorkerRequest<Record<string, (...args: unknown[]) => any>, string> {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    return 'id' in data && typeof data.id === 'string' && 'fn' in data && typeof data.fn === 'string';
}

export const setupWorker = <T extends BaseWorkerFunctionMap>(funcMap: T) => {
    worker.addEventListener('message', async (event) => {
        if (!event.data) {
            throw new Error('No data received in message by web worker');
        }
        const data = event.data;
        if (!isWorkerRequest(data)) {
            throw new Error(`Invalid data received in message by web worker: ${JSON.stringify(data)}`);
        }
        const { id, fn, args } = data;
        try {
            if (typeof funcMap[fn] !== 'function') {
                throw new Error(`Function ${fn} is not defined`);
            }
			const result: unknown = await funcMap[fn](...args);
            postWorkerResponse({ id, success: true, result });
		} catch (error) {
            postWorkerResponse({ id, success: false, error });
        }
    });
}