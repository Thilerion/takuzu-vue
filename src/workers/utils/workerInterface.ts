import type { WorkerRequest, BaseWorkerFunctionMap, WorkerResponse } from "./types";

type WorkerReqResult<M extends BaseWorkerFunctionMap, K extends keyof M> = Awaited<ReturnType<M[K]>>;
type WorkerReqPromise<M extends BaseWorkerFunctionMap, K extends keyof M> = Promise<WorkerReqResult<M, K>>;

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

/*
TODO:
- event emitter pattern that allows multiple parts of the application to listen to responses from the worker, not just the part that made the request
*/

export class WorkerInterface<T extends BaseWorkerFunctionMap> {
	readonly opts: Readonly<WorkerInterfaceOpts> = {
		autoStart: true,
		startOnInitialization: true,
	}
	private worker: Worker | null = null;
	private createWorker: () => Worker;
	private callbacks: Map<string, (response: WorkerResponse<any>) => void> = new Map();
	isActive = false;

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
	request<K extends keyof T, Params extends Parameters<T[K]>>(funcName: K, ...args: Params): WorkerReqPromise<T, K> {
		if (!this.isActive) {
			if (this.opts.autoStart) {
				this.start();
			} else {
				throw new Error('Worker is not running, cannot make request because autoStart is disabled. Call .start() first to manually start the worker instance.');
			}
		}
		return new Promise((resolve: (value: WorkerReqResult<T, K>) => void, reject) => {
            const id = this.generateId();
			this.callbacks.set(id, (data: WorkerResponse<WorkerReqResult<T, K>>) => {
				if (data.success) {
					return resolve(data.result);
				} else {
					return reject(data.error);
				}
            });
            const message: WorkerRequest<T, K> = { id, fn: funcName, args };
            this.worker!.postMessage(message);
		});
	}

	getRequestFn<K extends keyof T, Params extends Parameters<T[K]>>(funcName: K): (...args: Params) => WorkerReqPromise<T, K> {
		return (...args: Params) => this.request(funcName, ...args);
	}

	private generateId(): string {
		return self.crypto.randomUUID();
	}

	/**
	 * Terminates the worker, and rejects any pending requests.
	 * An optional custom error message can be provided, which will be used to reject any pending requests.
	 * 
	 * @param customRejectErrorMessage The error message to use when rejecting pending requests. Defaults to 'Worker terminated'.
	 */
	forceTerminate(customRejectErrorMessage: string = 'Worker terminated') {
		if (!this.isActive) {
			console.warn('WorkerInterface already terminated');
			return;
		}
		this.worker?.terminate();
		this.rejectPendingRequests(new Error(customRejectErrorMessage));
	}

	/**
	 * Restarts the worker if it is active, and rejects any pending requests.
	 * If the worker is not active, this does nothing.
	 */
	restart() {
		if (!this.isActive) {
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
		if (this.isActive) {
			console.warn('WorkerInterface already started');
			return;
		}

		this.worker = this.createWorker();
		this.setupListeners();
	}

	private setupListeners() {
		this.worker!.onmessage = (event: MessageEvent) => {
			const data = event.data as WorkerResponse<unknown>;
			const cb = this.callbacks.get(data.id);
			if (!cb) {
				throw new Error(`No callback found for id ${data.id}`);
			}
			cb(data);
			this.callbacks.delete(data.id);
		}
		this.worker!.onerror = (event: ErrorEvent) => {
			console.log('Worker onerror event fired. Worker will be terminated now.');
			console.error(event);
			// terminates the worker, as its state may become unpredictable after an error
			// this also rejects any pending requests with a custom error message
			this.forceTerminate(`Pending request rejected due to caught worker error: ${event.message}`);
		}
	}

	private rejectPendingRequests(error: Error) {
		for (const [id, cb] of this.callbacks) {
			cb({ id, success: false, error });
		}
		this.callbacks.clear();
	}
}