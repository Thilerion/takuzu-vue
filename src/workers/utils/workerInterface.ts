import type { Brand } from "@/lib/types.js";
import type { WorkerRequest, BaseWorkerFunctionMap, WorkerResponse } from "./types";

type WorkerReqResult<M extends BaseWorkerFunctionMap, K extends keyof M> = Awaited<ReturnType<M[K]>>;
type WorkerReqPromise<M extends BaseWorkerFunctionMap, K extends keyof M> = Promise<WorkerReqResult<M, K>>;
type WorkerReqPromiseWithId<M extends BaseWorkerFunctionMap, K extends keyof M> = Promise<WorkerReqResult<M, K>> & { id: WorkerRequestId };
type WorkerRequestId = Brand<string, 'WorkerInterfaceRequestId'>;

/* 
Example usage in a myWorker.ts file: 

import type { TestFnMap } from "./test-worker.worker"; // <== extends BaseWorkerFunctionMap
import { WorkerInterface } from "@/utils-lib/workers/workerInterface";

export const myTestWorker = new WorkerInterface<TestFnMap>({
	url: new URL('./test-worker.worker.ts', import.meta.url), // <== Vite way of getting a worker url
	options: { type: 'module' }
}, { startOnInitialization: true, autoStart: false });
 */

export type WorkerInterfaceWorkerSetupProp = {
	url: string | URL,
	options?: WorkerOptions
}
export type WorkerInterfaceOpts = {
	autoStart?: boolean,
	startOnInitialization?: boolean,
}
export type WorkerRequestStatus = 'pending' | 'success' | 'error' | 'aborted';

/* TODO:
- event emitter pattern that allows multiple parts of the application to listen to responses from the worker, not just the part that made the request
*/

export class WorkerInterface<T extends BaseWorkerFunctionMap> {
	readonly opts: Readonly<WorkerInterfaceOpts> = {
		autoStart: true,
		startOnInitialization: true,
	}
	private initialized = false;

	private worker: Worker | null = null;
	private createWorker: () => Worker;
	private callbacks: Map<WorkerRequestId, (response: WorkerResponse<any>) => void> = new Map();
	private requestStatusMap: Map<WorkerRequestId, WorkerRequestStatus> = new Map();

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
		const promiseWithId: WorkerReqPromiseWithId<T, K> = Object.assign(promise, { id: requestId });
		return promiseWithId;
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

	checkRequestStatus(requestId: WorkerRequestId): WorkerRequestStatus | null {
		return this.requestStatusMap.get(requestId) ?? null;
	}

	getRequestFn<K extends keyof T, Params extends Parameters<T[K]>>(funcName: K): (...args: Params) => WorkerReqPromise<T, K> {
		return (...args: Params) => this.request(funcName, ...args);
	}

	private generateId(): Brand<string, 'WorkerInterfaceRequestId'> {
		return self.crypto.randomUUID() as WorkerRequestId;
	}

	/**
	 * Terminates the worker, and rejects any pending requests.
	 * An optional custom error message can be provided, which will be used to reject any pending requests.
	 * 
	 * @param customRejectErrorMessage The error message to use when rejecting pending requests. Defaults to 'Worker terminated'.
	 */
	forceTerminate(customRejectErrorMessage: string = 'Worker terminated') {
		if (this.isReady()) {
			this.worker?.terminate();
			this.abortPendingRequests(new Error(customRejectErrorMessage));
		} else {
			console.warn('WorkerInterface already terminated or not started yet; cannot terminate it.');
		}

		this.worker = null;
		this.initialized = false;		
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
		this.worker!.onmessage = (event: MessageEvent) => {
			const data = event.data as WorkerResponse<unknown>;
			const id = typeof data.id === 'string' ? data.id as WorkerRequestId : null;

			const cb = this.callbacks.get(id!);
			if (!cb) {
				throw new Error(`No callback found for id ${id}`);
			}
			cb(data);
			this.callbacks.delete(id!);
		}
		this.worker!.onerror = (event: ErrorEvent) => {
			console.log('Worker onerror event fired. Worker will be terminated now.');
			console.error(event);
			// terminates the worker, as its state may become unpredictable after an error
			// this also rejects any pending requests with a custom error message
			this.forceTerminate(`Pending request rejected due to caught worker error: ${event.message}`);
		}
		this.initialized = true;
	}

	private abortPendingRequests(error: Error) {
		for (const [id, cb] of this.callbacks) {
			cb({ id, success: false, error });
			this.updateRequestStatus(id, 'aborted');
		}
		this.callbacks.clear();
	}

	private static readonly MAX_REQUEST_STATUS_HISTORY = 1000;
	private static readonly REQUEST_STATUS_CLEANUP_AMOUNT = 100;
	private cleanupOldRequestStatusesIfNeeded() {
		if (this.requestStatusMap.size > WorkerInterface.MAX_REQUEST_STATUS_HISTORY) {
			const toRemove = this.requestStatusMap.size - WorkerInterface.MAX_REQUEST_STATUS_HISTORY + WorkerInterface.REQUEST_STATUS_CLEANUP_AMOUNT;
			console.log(`[WorkerInterface]: Max history of stored request statuses reached; removing ${toRemove} oldest statuses.`);
			let count = 0;
			for (const [id, status] of this.requestStatusMap) {
				if (count >= toRemove) break;
				if (status !== 'pending') {
					this.requestStatusMap.delete(id);
					count += 1;
				}
			}
		}
	}
}