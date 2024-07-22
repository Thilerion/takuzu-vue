import type { BaseWorkerFunctionMap } from "./types.js";

/** The data object that is sent to the worker, and is received by the worker. */
export type WorkerRequest<
	Fns extends BaseWorkerFunctionMap,
	FnName extends keyof Fns
> = { id: string, fn: FnName, args: Parameters<Fns[FnName]> };

export function isWorkerRequest(data: unknown): data is WorkerRequest<BaseWorkerFunctionMap<unknown>, string> {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    return 'id' in data && typeof data.id === 'string' && 'fn' in data && typeof data.fn === 'string';
}

export type WorkerResponseSuccess<T> = { id: string, success: true, result: T };
export type WorkerResponseError = { id: string, success: false, error: unknown };
/** The data object that is sent from the worker, and is received by the main thread, in response to a request. */
export type WorkerResponse<T> = WorkerResponseSuccess<T> | WorkerResponseError;

export function isWorkerResponse(data: unknown): data is WorkerResponse<unknown> {
	if (typeof data !== 'object' || data === null) {
		return false;
	}
	if (!('id' in data) || typeof data.id !== 'string') return false;
	// Check if success is a boolean
	if (!('success' in data) || typeof data.success !== 'boolean') return false;
	// Check if there is an error or result property based on the value of the success property
	const isSuccess = data.success;
	if (isSuccess) {
		return 'result' in data;
	} else {
		return 'error' in data;
	}
}