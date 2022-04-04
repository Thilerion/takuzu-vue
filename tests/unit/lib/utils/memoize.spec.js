import { expect, it, beforeEach, test, describe, vi } from 'vitest';
import { memoize } from '../../../../src/lib/utils';

describe('memoize function', () => {
	it('correctly memoizes results with a single argument', () => {
		const fn = vi.fn(x => x * 2);
		const argsToKeyFn = vi.fn((argA) => String(argA));
		const memoized = memoize(
			fn,
			{ argsToKey: argsToKeyFn }
		);

		expect(memoized(1)).toBe(2);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(argsToKeyFn).toHaveBeenCalledTimes(1);

		expect(memoized(1)).toBe(2);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(argsToKeyFn).toHaveBeenCalledTimes(2);
	})

	it('correctly memoized results with multiple arguments', () => {
		const fn = vi.fn((argA = [], argB = 1, argC = 1) => {
			return (argA.length + argB + argC) * 2;
		});
		const argsToKeyFn = vi.fn((argA, argB, argC) => {
			return [argA, argB, argC].flat(2).join('');
		});
		const memoized = memoize(
			fn,
			{ argsToKey: argsToKeyFn }
		);

		expect(memoized([], 1, 1)).toBe(4);
		expect(fn).toHaveBeenCalledTimes(1);

		expect(memoized([1, 2, 3, 4], 1, 2)).toBe(14);
		expect(fn).toHaveBeenCalledTimes(2);
		expect(memoized([1, 2, 3, 4], 1, 2)).toBe(14);
		expect(fn).toHaveBeenCalledTimes(2);

		expect(memoized([1, 2, {}, 4], 1, 2)).toBe(14);
		expect(fn).toHaveBeenCalledTimes(3);
	})

	it('correctly exposes cache', () => {
		const fn = vi.fn(x => x * 2);
		const argsToKeyFn = vi.fn((argA) => String(argA));
		const memoized = memoize(
			fn,
			{ argsToKey: argsToKeyFn }
		);

		expect(memoized.cache).toBeInstanceOf(Map);
		expect(memoized.cache.size).toBe(0);

		memoized(1);
		memoized(1);
		memoized(2);
		memoized(3);
		memoized(2);

		expect(memoized.cache.size).toBe(3);
	})

	it('has a cache that can be reset', () => {
		const fn = vi.fn(x => x * 2);
		const argsToKeyFn = vi.fn((argA) => String(argA));
		const memoized = memoize(
			fn,
			{ argsToKey: argsToKeyFn }
		);

		expect(memoized.cache.size).toBe(0);

		memoized(1);
		memoized(2);

		expect(memoized.cache.size).toBe(2);

		memoized.cache.clear();

		expect(memoized.cache.size).toBe(0);
		memoized(1);
		expect(memoized.cache.size).toBe(1);

		const newCache = new Map();
		memoized.cache = newCache;
		expect(memoized.cache.size).toBe(0);
		memoized(1);
		expect(memoized.cache.size).toBe(1);
		expect(memoized.cache).toBe(newCache);
	})
})