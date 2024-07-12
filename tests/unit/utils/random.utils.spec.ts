import { afterAll, beforeAll, beforeEach, describe, expect, it, test } from 'vitest';
import * as Rnd from '../../../src/utils/random.utils';
import type { RngSource } from '../../../src/utils/random.utils';

function* rngGen(): Generator<number> {
	const items = [
		0.5, 0.25, 0.24, 0, 0.9999999, 0.3, 0.01,
		...Array(10).fill(null).map((_v, index) => {
			return index / 10;
		})
	]
	while (true) {
		for (const value of items) {
			yield value;
		}
	}
}
const createCustomRng = () => {
	const gen = rngGen();
	return vi.fn(() => {
		return gen.next().value as number;
	})
}
const getNValuesFromFn = <T extends () => any, Ret extends ReturnType<T>>(fn: T, n: number): (Ret)[] => {
	const arr: Ret[] = [];
	for(let i = 0; i < n; i++) {
		const val: Ret = fn();
		arr.push(val);
	}
	return arr;
}

describe('custom rng', () => {
	let rng: RngSource = createCustomRng();
	let origMathRandom: typeof Math.random;
	beforeEach(() => {
		rng = createCustomRng();
		Math.random = rng;
	})
	beforeAll(() => {
		origMathRandom = Math.random;
	})
	afterAll(() => {
		Math.random = origMathRandom;
	})
	test('it works', () => {
		const get20Times = getNValuesFromFn(rng, 20);
		expect(get20Times).toMatchInlineSnapshot(`
			[
			  0.5,
			  0.25,
			  0.24,
			  0,
			  0.9999999,
			  0.3,
			  0.01,
			  0,
			  0.1,
			  0.2,
			  0.3,
			  0.4,
			  0.5,
			  0.6,
			  0.7,
			  0.8,
			  0.9,
			  0.5,
			  0.25,
			  0.24,
			]
		`);
	})

	test('it resets between tests', () => {
		const rngRes = getNValuesFromFn(Math.random, 10);
		expect(rngRes).toMatchInlineSnapshot(`
			[
			  0.5,
			  0.25,
			  0.24,
			  0,
			  0.9999999,
			  0.3,
			  0.01,
			  0,
			  0.1,
			  0.2,
			]
		`);
	})
	test('it resets between tests 2', () => {
		const rngRes = getNValuesFromFn(Math.random, 10);
		expect(rngRes).toMatchInlineSnapshot(`
			[
			  0.5,
			  0.25,
			  0.24,
			  0,
			  0.9999999,
			  0.3,
			  0.01,
			  0,
			  0.1,
			  0.2,
			]
		`);
	})
})

describe('Random utils', () => {
	let rng: RngSource = createCustomRng();
	let origMathRandom: typeof Math.random;
	beforeEach(() => {
		rng = createCustomRng();
		Math.random = rng;
	})
	beforeAll(() => {
		origMathRandom = Math.random;
	})
	afterAll(() => {
		Math.random = origMathRandom;
	})

	test('randomInt()', () => {
		const result = getNValuesFromFn(() => Rnd.randomInt(10), 10);
		const expected = [5, 2, 2, 0, 9, 3, 0, 0, 1, 2];
		expect(result).toEqual(expected);
	})

	test('randomIntBetween()', () => {
		const result = getNValuesFromFn(() => Rnd.randomIntBetween(0, 10), 10);
		const expected = [5, 2, 2, 0, 9, 3, 0, 0, 1, 2];
		expect(result).toEqual(expected);
	})
	test('randomIntBetweenIncl() can include the max', () => {
		const result = getNValuesFromFn(() => Rnd.randomIntBetweenIncl(0, 10), 10);
		expect(result).toContain(10);
	})

	describe('on arrays', () => {
		test('getRandomItem()', () => {
			const arr = [1, 2];
			const result = [
				Rnd.getRandomItem(arr, () => 0),
				Rnd.getRandomItem(arr, () => 0.9),
				Rnd.getRandomItem(arr, () => 0.5),
			]
			expect(result).toContain(1);
			expect(result).toContain(2);
			expect(arr).toEqual([1, 2]);
		})

		test('pluckRandomItem()', () => {
			const arr = [1, 2, 3, 4];
			expect(Rnd.pluckRandomItem(arr, () => 0)).toBe(1);
			expect(arr).toEqual([2, 3, 4]);
			const results = [Rnd.pluckRandomItem(arr),Rnd.pluckRandomItem(arr),Rnd.pluckRandomItem(arr)];
			expect(arr).toEqual([]);
			expect(results).toMatchInlineSnapshot(`
				[
				  3,
				  2,
				  4,
				]
			`);
		})

		describe('sample()', () => {
			it('returns a sample of a specific size', () => {
				const arr = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
				const sampleA = Rnd.sample(arr, 1, () => 0);
				expect(sampleA).toEqual([1]);
				expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

				const sampleB = Rnd.sample(arr, 9, () => 0);
				const sampleBSet = new Set(sampleB);
				// no duplicates
				expect(sampleB.length).toBe(sampleBSet.size);
			})

			it('returns all items shuffled when sample size is as large as input', () => {
				const arr = Object.freeze([1, 2, 3, 4]);
				const result = Rnd.sample(arr, arr.length);
				expect(result).not.toBe(arr);
				expect([...result].sort()).toEqual([...arr].sort());
				expect(result).not.toEqual([...arr]); // different order
			})

		})

		describe('pluckSample()', () => {
			it('returns a sample removed from array', () => {
				const origArr = Object.freeze([1, 2, 3, 4, 5, 6]);
				const arr = [...origArr];
				const result = Rnd.pluckSample(arr, 3);
				expect(result).toMatchInlineSnapshot(`
					[
					  4,
					  2,
					  1,
					]
				`);

				const combined = [...result, ...arr].sort();
				expect(combined).toEqual(origArr);
			})
		})

		describe('shuffleCopy()', () => {
			it('shuffles the array without mutating the original array', () => {
				const origArr = Object.freeze([1, 2, 3, 4, 5, 6]);
				const arr = [...origArr];
				const result = Rnd.shuffle(arr);
				expect(result).not.toBe(arr);
				expect(result).not.toEqual(arr);
				expect(result).not.toEqual(origArr);
				expect(result).toMatchInlineSnapshot(`
					[
					  4,
					  3,
					  2,
					  1,
					  5,
					  6,
					]
				`);
				expect(arr).toEqual(origArr);
			})
		})

		describe('pickRandomWeighted', () => {
			let pickRandomWeightedOrigRnd: <T>(items: Rnd.WeightedArrayItem<T>[]) => T;
			beforeEach(() => {
				pickRandomWeightedOrigRnd = (items) => Rnd.pickRandomWeighted(items, origMathRandom);
			})
			it('picks items proportionally to their weight on average', () => {
				const items: Rnd.WeightedArrayItem<1 | 2 | 3>[] = [
					[1, 0.5], // approx 0.5/44 chance => 1.14%
					[2, 3.5], // approx 3.5/44 chance => 7.72%
					[3, 40], // approx 40/41 chance => 90.9% => 
				];

				const results = {
					1: 0,
					2: 0,
					3: 0
				}
				const N = 1e6;

				for (let i = 0; i < N; i++) {
					const result = Rnd.pickRandomWeighted(items, origMathRandom);
					results[result] += 1;
				}

				expect(results[3]).toBeGreaterThan(N * 89 / 100);
				expect(results[3]).toBeLessThan(N * 92 / 100);

				expect(results[2]).toBeGreaterThan(N * 6.75 / 100);
				expect(results[2]).toBeLessThan(N * 8.5 / 100);

				expect(results[1]).toBeGreaterThan(N * 1 / 100);
				expect(results[1]).toBeLessThan(N * 1.8 / 100);
			})

			it('uses the provided rng function', () => {
				const localRng = vi.fn(() => 0.5);
				expect(localRng).toHaveBeenCalledTimes(0);

				const res = Rnd.pickRandomWeighted([
					['a', 10],
					['b', 20],
				], localRng);
				expect(['a', 'b'].includes(res)).toBe(true);
				expect(localRng).toHaveBeenCalledTimes(1);
			})

			it('throws an error if any weight is 0 or negative', () => {
				expect(() => pickRandomWeightedOrigRnd([
					[0, 0.5],
					[123, 123456789],
					[1, 0],
				])).toThrowError('All weights must be greater than 0 (got "0" for item at index 2)');

				expect(() => pickRandomWeightedOrigRnd([
					[0, -0.0001],
					[123, 123456789],
					[1, 0],
				])).toThrowError('All weights must be greater than 0 (got "-0.0001" for item at index 0)');
			})

			it('throws an error if any weight is NaN or not a number', () => {
				expect(() => pickRandomWeightedOrigRnd([
					[0, 0.5],
					[1, NaN],
				])).toThrowError('All weights must be numbers (got "NaN" for item at index 1)');
				expect(() => pickRandomWeightedOrigRnd([
					[0, 0.5],
					// @ts-expect-error null is not a valid weight
					[1, null],
				])).toThrowError('All weights must be numbers (got "null" for item at index 1)');
			})

			it('throws an error if any weight is infinite', () => {
				expect(() => pickRandomWeightedOrigRnd([
					[0, 0.5],
					[1, Infinity],
				])).toThrowError('All weights must be finite (got "Infinity" for item at index 1)');
			})

			it('throws an error if there are no items', () => {
				expect(() => pickRandomWeightedOrigRnd([])).toThrowError('Cannot pick random item from empty array');
			})

			it('simply returns the first item if there is only one item', () => {
				expect(rng).toHaveBeenCalledTimes(0);
				expect(pickRandomWeightedOrigRnd([['abc', 123456]])).toBe('abc');
				expect(rng).toHaveBeenCalledTimes(0);
			})

			it('uses the provided rng function if all weights are the same', () => {
				// Previously had a bug where, when all weights were the same pickRandom() was called instead of pickRandomWeighted(), but the rng was not passed to pickRandom()
				const localRng = vi.fn(() => 0.5);
				expect(localRng).toHaveBeenCalledTimes(0);

				Rnd.pickRandomWeighted([
					['a', 10],
					['b', 10],
				], localRng);
				expect(localRng).toHaveBeenCalledTimes(1);
			})

			it('works with a large discrepancy between weights', () => {
				const items: Rnd.WeightedArrayItem<string>[] = [
					['a', 0.001],
					['b', 10000],
					['c', 0.001]
				];
				const MAX_ATTEMPTS = 1e7;
				let foundAt: null | number = null;
				for (let i = 0; i < MAX_ATTEMPTS; i++) {
					const result = Rnd.pickRandomWeighted(items, Math.random);
					if (result !== 'b') {
						foundAt = i;
						break;
					}
				}
				expect(foundAt).not.toBe(null);
			})
		})

		it('works with very large arrays', () => {
			const values = Array(10_000).fill(null).map((_, idx) => idx);
			const items: Rnd.WeightedArrayItem<number>[] = values.map(val => [val, 0.123]);
			items[10][1] = 0.234;
			items[1800][1] = 0.1;
			items[9980][1] = 0.123456789;

			const rngMax = () => 1 - Number.EPSILON;
			expect(Rnd.pickRandomWeighted(items, rngMax)).toBe(9999);

			expect(Rnd.pickRandomWeighted(items, () => 0)).toBe(0);
		})
	})
})