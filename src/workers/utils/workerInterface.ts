import type { Brand } from "@/lib/types.js";
import type { BaseWorkerFunctionMap } from "./types";
import { isWorkerResponse, type WorkerRequest, type WorkerResponse } from "./request.js";

/*
Example usage in a myWorkerHandler.ts file:

import type { MyWorkerFns } from "./myWorker.worker.js"; // <-- extends BaseWorkerFunctionMap
import { WorkerInterface, type WorkerInterfaceOpts } from "path/to/workerInterface.js";

let _worker: null | Worker = null; // <-- a singleton of the worker to use, needed for Vite to correctly load/parse the worker
const createWorker = () => {
	if (_worker != null) return _worker;
	_worker = new Worker(
		new URL('./myWorker.worker.ts', import.meta.url),
		{ type: 'module' }
	);
	return _worker;
}
const myWorker = new WorkerInterface<MyWorkerFns>(
	createWorker,
	{ startOnInitialization: true, autoStart: false } // <-- WorkerInterfaceOpts
);
// myWorker can be exported from this file, or individual functions can be exported
// alternatively, a function can be exported that creates a workerInterface instance itself, but it needs to set its own "_worker" as well
*/

type WorkerReqResult<M extends BaseWorkerFunctionMap, K extends keyof M> = Awaited<ReturnType<M[K]>>;
type WorkerReqPromise<M extends BaseWorkerFunctionMap, K extends keyof M> = Promise<WorkerReqResult<M, K>>;
type WorkerReqPromiseWithId<M extends BaseWorkerFunctionMap, K extends keyof M> = Promise<WorkerReqResult<M, K>> & { id: WorkerRequestId };
export type WorkerRequestId = Brand<string, 'WorkerInterfaceRequestId'>;

export type WorkerInterfaceOpts = {
	autoStart?: boolean,
	startOnInitialization?: boolean,
	listenForUnknownMessages?: boolean,
}
export type WorkerOngoingRequest<M extends BaseWorkerFunctionMap> = {
	funcName: keyof M,
	args: string,
	promise: WorkerReqPromiseWithId<M, keyof M>
}
export type WorkerRequestStatus = 'pending' | 'success' | 'error' | 'aborted';

/* TODO:
- event emitter pattern that allows multiple parts of the application to listen to responses from the worker, not just the part that made the request
- listen on the WorkerInterface instance for messages received from the worker that have no corresponding request, if this is desired
*/

export class WorkerInterface<T extends BaseWorkerFunctionMap> {
	readonly opts: Readonly<WorkerInterfaceOpts> = {
		autoStart: true,
		startOnInitialization: true,
		listenForUnknownMessages: false,
	}
	private initialized = false;

	private worker: Worker | null = null;
	private createWorker: () => Worker;
	private callbacks: Map<WorkerRequestId, (response: WorkerResponse<any>) => void> = new Map();
	private ongoingRequests: WorkerOngoingRequest<T>[] = []; 
	private requestStatusMap: Map<WorkerRequestId, WorkerRequestStatus> = new Map();

	private onUnknownMessageCallback: ((messageData: unknown) => void) | null = null;

	constructor(
		createWorker: () => Worker,
		opts: WorkerInterfaceOpts = {}
	) {
		this.createWorker = createWorker;
		this.opts = {
			...this.opts,
			...opts,
		}

		if (this.opts.startOnInitialization) {
			this.start();
		}
	}

	isReady(): boolean {
		return this.worker != null && !!this.initialized;
	}

	/** Returns true if there are any pending requests. */
	hasPendingRequests() {
		return this.callbacks.size > 0;
	}

	/**
	 * Makes a request to the worker, and returns a promise that resolves when the worker responds.
	 * If the worker is not active, it will be started automatically if the `autoStart` option is enabled. If autoStart is disabled, an error will be thrown.
	 * 
	 * @param funcName The name of the function to call on the worker.
	 * @param args The arguments to pass to the function.
	 */
	request<K extends keyof T, Params extends Parameters<T[K]>>(funcName: K, ...args: Params): WorkerReqPromiseWithId<T, K> {
		if (!this.isReady()) {
			if (this.opts.autoStart) {
				this.start();
			} else {
				throw new Error('Worker is not running, cannot make request because autoStart is disabled. Call .start() first to manually start the worker instance.');
			}
		}

		const requestId = this.generateId();
		const promise = this._makeRequest(funcName, requestId, ...args);
		const promiseWithId = promise as WorkerReqPromiseWithId<T, K>;
		promiseWithId.id = requestId;

		// Add to ongoingRequests
		const ongoingRequest: WorkerOngoingRequest<T> = { funcName, args: JSON.stringify(args), promise: promiseWithId };
		this.ongoingRequests.push(ongoingRequest);

		// Remove from ongoingRequests after it resolves or rejects
		promiseWithId.then(
			() => this.removeOngoingRequest(requestId),
			() => this.removeOngoingRequest(requestId)
		)

		return promiseWithId;
	}

	/**
	 * Make a request, same of request(), but returns an object with the promise and the request id separately.
	 * @see request()
	 */
	requestWithId<K extends keyof T, Params extends Parameters<T[K]>>(funcName: K, ...args: Params): {
		promise: WorkerReqPromiseWithId<T, K>,
		id: WorkerRequestId
	} {
		const promiseWithId = this.request(funcName, ...args);
		const id = promiseWithId.id;
		return { promise: promiseWithId, id };
	}

	private removeOngoingRequest(requestId: WorkerRequestId) {
		const index = this.ongoingRequests.findIndex(req => req.promise.id === requestId);
		if (index !== -1) {
			this.ongoingRequests.splice(index, 1);
		}
	}


	private _makeRequest<
		K extends keyof T, Params extends Parameters<T[K]>
	>(
		funcName: K,
		requestId: WorkerRequestId,
		...args: Params
	): WorkerReqPromise<T, K> {		
		return new Promise((resolve: (value: WorkerReqResult<T, K>) => void, reject) => {
			this.callbacks.set(requestId, (data: WorkerResponse<WorkerReqResult<T, K>>) => {
				if (data.success) {
					this.updateRequestStatus(requestId, 'success');
					return resolve(data.result);
				} else {
					this.updateRequestStatus(requestId, 'error');
					return reject(data.error);
				}
            });
			this.updateRequestStatus(requestId, 'pending');
            const message: WorkerRequest<T, K> = { id: requestId, fn: funcName, args };
            this.worker!.postMessage(message);
		});
	}

	private updateRequestStatus(requestId: WorkerRequestId, status: WorkerRequestStatus) {
		this.requestStatusMap.set(requestId, status);
		this.cleanupOldRequestStatusesIfNeeded();
	}

	/** Returns the status of a request, or null if the request is not found. */
	checkRequestStatus(requestId: string): WorkerRequestStatus | null {
		return this.requestStatusMap.get(requestId as WorkerRequestId) ?? null;
	}

	/** Returns a function that can be used to make requests, without having to specify the function name. */
	getRequestFn<K extends keyof T, Params extends Parameters<T[K]>>(funcName: K): (...args: Params) => WorkerReqPromise<T, K> {
		return (...args: Params) => this.request(funcName, ...args);
	}

	/** Returns the OngoingRequest object with the specified function name and (optionally) the same arguments, or null if no such request is found. */
	findOngoingRequest<K extends keyof T>(funcName: K, opts: {
		compareArgs?: boolean,
		args: Parameters<T[K]>,
	}): WorkerOngoingRequest<T> | null {
		const { compareArgs = true, args } = opts;
		const strArgs = JSON.stringify(args);

		const found = this.ongoingRequests.find(request => {
			const { args: argsB, funcName: funcNameB } = request;
			if (compareArgs && argsB !== strArgs) return false;
			return funcNameB === funcName;
		})
		return found ?? null;
	}

	/**
     * Makes a request to the worker if an identical request is not already pending.
     * If an identical request is pending, it returns the existing promise.
     * 
     * @param funcName The name of the function to call on the worker.
     * @param args The arguments to pass to the function.
     */
    requestDeduplicated<K extends keyof T, Params extends Parameters<T[K]>>(funcName: K, ...args: Params): WorkerReqPromiseWithId<T, K> {
        const existingRequest = this.findOngoingRequest(funcName, { compareArgs: true, args });
        if (existingRequest) {
			console.log('Found existing request for funcName:', funcName);
            return existingRequest.promise;
        }
        return this.request(funcName, ...args);
    }

	private generateId(): Brand<string, 'WorkerInterfaceRequestId'> {
		return self.crypto.randomUUID() as WorkerRequestId;
	}

	/**
	 * Terminates the worker, and rejects any pending requests.
	 * An optional custom error message can be provided, which will be used to reject any pending requests.
	 * 
	 * @param customRejectErrorMessage The error message to use when rejecting pending requests. Defaults to 'Worker terminated'.
	 * @returns A boolean that indicates whether this method call has terminated the worker.
	 */
	forceTerminate(customRejectErrorMessage: string = 'Worker terminated'): boolean {
		let hasTerminated: boolean;
		if (this.isReady()) {
			this.worker?.terminate();
			this.abortPendingRequests(new Error(customRejectErrorMessage));
			hasTerminated = true;
		} else {
			console.warn('WorkerInterface already terminated or not started yet; cannot terminate it.');
			hasTerminated = false;
		}

		this.ongoingRequests = [];
		// Should not clear requestStatusMap, as it can be used to check that a request was "aborted"
		// this.requestStatusMap.clear();

		this.worker = null;
		this.initialized = false;
		return hasTerminated;	
	}

	/**
	 * Restarts the worker if it is active, and rejects any pending requests.
	 * If the worker is not active, this does nothing.
	 */
	restart() {
		if (!this.isReady()) {
			console.warn('Cannot restart worker; it is not active.');
			return;
		}
		this.forceTerminate();
		this.start();
	}

	/**
	 * Starts the worker if it is not active.
	 * If the worker is already active, this does nothing.
	 */
	start() {
		if (this.isReady()) {
			console.warn('WorkerInterface already started');
			return;
		}

		this.worker = this.createWorker();
		this.setupListeners();
	}

	private setupListeners() {
		if (this.isReady()) {
			throw new Error('WorkerInterface already started; cannot setup listeners.');
		}
		this.worker!.onmessage = (event: MessageEvent<unknown>) => {
			const isValidWorkerResponse = isWorkerResponse(event.data);
			const hasRequestId = isValidWorkerResponse && 'id' in event.data && this.callbacks.has(event.data.id as WorkerRequestId);
			if (isValidWorkerResponse && hasRequestId) {
				const id = event.data.id as WorkerRequestId;
				const cb = this.callbacks.get(id)!;
				cb(event.data);
				this.callbacks.delete(id!);
			} else if (isValidWorkerResponse && !hasRequestId && !this.opts.listenForUnknownMessages) {
				throw new Error(`[WorkerInterface]: Received a message from the worker with id "${event.data.id}", but no callback was found for this id.`);
			} else if (this.opts.listenForUnknownMessages) {
				// pass to a callback if one is set
				if (this.onUnknownMessageCallback != null) {
					this.onUnknownMessageCallback(event.data);
				} else {
					console.warn('WorkerInterface received an unknown message, but no callback was set for it. Message data:', event.data);
				}
				return;
			} else {
				console.error('[WorkerInterface]: Received a message from the worker, but it is not a valid WorkerResponse. Data received:', event.data);
				throw new Error(`[WorkerInterface]: Received a message from the worker, but it is not a valid WorkerResponse.`);
			}
		}
		this.worker!.onerror = (event: ErrorEvent) => {
			console.log('Worker onerror event fired. Worker will be terminated now.');
			console.error(event);
			// terminates the worker, as its state may become unpredictable after an error
			// this also rejects any pending requests with a custom error message
			this.forceTerminate(`Pending request rejected due to caught worker error: ${event.message}`);
		}
		this.worker!.onmessageerror = (event: MessageEvent<unknown>) => {
			event.preventDefault();
			console.log('Worker onmessageerror event fired. Worker will be terminated now.');
			const eventData = event.data ?? null;
			if (eventData != null) {
				console.error(`The following data was received that resulted in the messageerror event:`, eventData);
			}
			console.error(event);
			// aborts all pending requests, as it is unknown from which request the error originated from
			// however, the worker does not have to be terminated, as it is still running
			this.abortPendingRequests(new Error(`Pending request rejected due to caught worker messageerror.`));
		}
		this.initialized = true;
	}

	onUnknownMessage(callback: ((messageData: unknown) => void) | null) {
		if (!this.opts.listenForUnknownMessages) {
			throw new Error('WorkerInterface does not listen for unknown messages, so cannot set an onUnknownMessage callback.');
		}
		this.onUnknownMessageCallback = callback;
	}

	private abortPendingRequests(error: Error) {
		console.log(this.callbacks.entries())
		for (const [id, cb] of this.callbacks) {
			cb({ id, success: false, error });
			this.updateRequestStatus(id, 'aborted');
		}
		this.callbacks.clear();
	}

	private static readonly MAX_REQUEST_STATUS_HISTORY = 1000;
	private static readonly REQUEST_STATUS_CLEANUP_AMOUNT = 100;
	private cleanupOldRequestStatusesIfNeeded() {
		const size = this.requestStatusMap.size;
		const max = WorkerInterface.MAX_REQUEST_STATUS_HISTORY;
		if (size > max) {			
			const toRemove = (size - max) + WorkerInterface.REQUEST_STATUS_CLEANUP_AMOUNT;
			let count = 0;
			for (const [id, status] of this.requestStatusMap) {
				if (status !== 'pending') {
					this.requestStatusMap.delete(id);
					count += 1;
				}
				if (count >= toRemove) break;
			}
		}
	}
}