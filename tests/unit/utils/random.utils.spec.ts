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
	return () => {
		return gen.next().value as number;
	}
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
				const result = Rnd.shuffleCopy(arr);
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
	})
})