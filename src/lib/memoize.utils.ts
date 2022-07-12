/* eslint-disable @typescript-eslint/no-explicit-any */
type MemoizableFn = (...args: any[]) => any;
type SerializeArgs<T extends MemoizableFn> = (...args: Parameters<T>) => any;
type MemoizeCache<T extends MemoizableFn> = Map<any, ReturnType<T>>;

export interface Memoized<T extends MemoizableFn> {
	(...args: Parameters<T>): ReturnType<T>
	cache: MemoizeCache<T>;
}

export function memoize<T extends MemoizableFn>(
	fn: T,
	serializeArgs: SerializeArgs<T> = (...args: any[]) => args.join(',')
): Memoized<T> {
	const cache: MemoizeCache<T> = new Map();
	const memoized: Memoized<T> = function (...args: Parameters<T>) {
		const key = serializeArgs(...args);
		if (memoized.cache.has(key)) {
			return memoized.cache.get(key)!;
		}
		const result: ReturnType<T> = fn(...args);
		memoized.cache.set(key, result);
		return result;
	}
	memoized.cache = cache;
	return memoized;
}