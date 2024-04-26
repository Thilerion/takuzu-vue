/* eslint-disable @typescript-eslint/no-explicit-any */
type MemoizableFn = (...args: any[]) => any;
type SerializeArgs<T extends MemoizableFn> = (...args: Parameters<T>) => any;
export type MemoizeCache<T extends MemoizableFn> = Map<any, ReturnType<T>>;

export interface Memoized<T extends MemoizableFn> {
	(...args: Parameters<T>): ReturnType<T>
	cache: MemoizeCache<T>;
}

/**
 * Creates a memoized version of a function.
 * 
 * The `memoize` function takes a function `fn` and returns a new function that caches the results of calling `fn` with specific arguments.
 * This can improve performance by avoiding expensive computations if the function is called with the same arguments multiple times.
 * 
 * @param fn - The function to memoize.
 * @param serializeArgs - A function that takes the arguments to `fn` and returns a key to store the result under in the cache. By default, stringifies the arguments and joins them with a comma.
 * 
 * @returns A new function that wraps `fn` with caching logic. This function also has a `cache` property that exposes the internal cache of memoized results.
 */
export function memoize<T extends MemoizableFn>(
	fn: T,
	serializeArgs: SerializeArgs<T> = (...args: any[]) => args.map(a => JSON.stringify(a)).join(',')
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