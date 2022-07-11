export interface IWorkerError<E> {
	success: false,
	error: E,
	source: string
}
export interface IWorkerSuccess<T> {
	success: true,
	value: T,
	source: string
}

export type IWorkerResult<T, E> = IWorkerError<E> | IWorkerSuccess<T>;

function WorkerError<R>(errorDescription: R, source: string): IWorkerError<R> {
	return { success: false, error: errorDescription, source };
}

function WorkerSuccess<T>(value: T, source: string): IWorkerSuccess<T> {
	return { success: true, value, source };
}

type CreateWorkerResultArgs<T, E> = [success: false, description: E, source: string] | [success: true, value: T, source: string];

export function createWorkerResult<E>(success: false, value: E, source: string): IWorkerError<E>;
export function createWorkerResult<T>(success: true, value: T, source: string): IWorkerSuccess<T>;
export function createWorkerResult<T, E>(success: boolean, value: T | E, source: string): IWorkerError<E> | IWorkerSuccess<T>;
export function createWorkerResult<T, E>(...args: CreateWorkerResultArgs<T, E>): IWorkerError<E> | IWorkerSuccess<T> {
	const [success, descriptionOrValue, source] = args;
	if (success) {
		return WorkerSuccess(descriptionOrValue, source);
	} else {
		return WorkerError(descriptionOrValue, source);
	}
}