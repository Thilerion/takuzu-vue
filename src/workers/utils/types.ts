export type BaseWorkerFunctionMap = Record<string, (...args: any[]) => any>;
export type WorkerFunctionMap<T extends BaseWorkerFunctionMap> = T;

export type WorkerRequest<
	Fns extends BaseWorkerFunctionMap,
	FnName extends keyof Fns
> = { id: string, fn: FnName, args: Parameters<Fns[FnName]> };

export type WorkerSuccess<T> = { id: string, success: true, result: T };
export type WorkerError = { id: string, success: false, error: unknown };
export type WorkerResponse<T> = WorkerSuccess<T> | WorkerError;