type MemoizableFn = (...args: any[]) => any;
type SerializeArgs<T extends MemoizableFn> = (...args: Parameters<T>) => any;
type MemoizeCache<T extends MemoizableFn, K extends SerializeArgs<T>> = Map<K, ReturnType<T>>

export function memoize<T extends MemoizableFn>(
	fn: T,
	serializeArgs: SerializeArgs<T> = (...args: any[]) => args.join(',')
) {
	let cache: MemoizeCache<T, typeof serializeArgs> = new Map();
	let memoized = function (...args: Parameters<T>) {
		const key = serializeArgs(...args);
		if (memoized.cache.has(key)) {
			return memoized.cache.get(key);
		}
		const result = fn(...args);
		memoized.cache.set(key, result);
		return result;
	} as T & { cache: typeof cache };
	memoized.cache = cache;
	return memoized;
}