import { expect, test, describe, it } from 'vitest';

import { sum, mean, percentile, minMax, median, iqr, stdDev, zScores } from '@/utils/array.utils.js';
import { cartesian } from '@/utils/array.ts.utils';

describe('cartesian()', () => {
	const sortCartesianResultInner = (a, b) => {
		return [...a].join('') - [...b].join('');
	}
	const sortedResult = (arr) => [...arr].sort(sortCartesianResultInner);

	it('should return the cartesian product of non-empty arrays', () => {
		const factorsA = [
			[1, 2],
			[3, 4],
		];
		const origFactorsA = factorsA.map(row => [...row]);
		const resultA = cartesian(factorsA);
		expect(resultA).toEqual([
			[1, 3],
			[2, 3],
			[1, 4],
			[2, 4],
		]);
		expect(factorsA).toEqual(origFactorsA);

		const factorsB = [
			[1, 2],
			[3],
			[4, 5, 6]
		];
		const resultB = cartesian(factorsB);
		expect(resultB).toEqual([
			[1, 3, 4],
			[2, 3, 4],
			[1, 3, 5],
			[2, 3, 5],
			[1, 3, 6],
			[2, 3, 6]
		]);
	})

	it('should work with empty arrays', () => {
		const factors = [
			[1, 2, 3],
			[],
			[],
			[4]
		];
		const result = cartesian(factors);
		const expected = sortedResult([
			[1, 4],
			[2, 4],
			[3, 4]
		]);
		expect(result).toEqual(expected);
	})

	it('should work with a value instead of an array', () => {
		const factors = [
			[1, 2, 3],
			[4]
		];
		const factorsB = [
			[1, 2, 3],
			4
		];
		const resultA = cartesian(factors);
		const resultB = cartesian(factorsB);

		expect(resultA).toEqual(resultB);
		expect(resultA).toMatchInlineSnapshot(`
			[
			  [
			    1,
			    4,
			  ],
			  [
			    2,
			    4,
			  ],
			  [
			    3,
			    4,
			  ],
			]
		`);
	})
})

describe('array statistics', () => {
	test('sum array', () => {
		expect(sum([1, 2, 3])).toBe(6);
		expect(sum([5, -5, 10, 0])).toBe(10);
		expect(sum([-5.4])).toBeCloseTo(-5.4);
		expect(sum([])).toBe(0);
	})

	test('mean', () => {
		expect(mean([2])).toBe(2);
		expect(mean([])).toBeUndefined();
	})

	test('percentile', () => {
		const arrA = [1, 2, 3];
		expect(percentile(arrA, .5)).toBe(2);
		expect(percentile(arrA, .0)).toBe(1);
		expect(percentile(arrA, 1)).toBe(3);
		expect(percentile(arrA, .75)).toBe(2.5);
		expect(percentile(arrA, .25)).toBe(1.5);

		const arrB = [2, 2, 3, 3];
		expect(percentile(arrB, .5)).toBe(2.5);
		expect(percentile(arrB, 0)).toBe(2);
		expect(percentile(arrB, 1)).toBe(3);
		expect(percentile(arrB, .75)).toBe(3);
		expect(percentile(arrB, .666667)).toBeCloseTo(3);
	})

	test('median', () => {
		const arr = [2, 4, 4, 6, 6, 8, 10, 10, 10, 20];
		expect(median(arr)).toBe(7);
		expect(mean(arr)).not.toBe(7);
	})
	test('iqr', () => {
		const arr = [2, 4, 4, 6, 6, 8, 10, 10, 10, 20];
		expect(iqr(arr)).toBe(6);
	})

	test('min max', () => {
		const arrA = [-10, -9.99, -20, 1];
		expect(minMax(arrA)).toEqual([-20, 1]);
		expect(minMax([-100, -10, -Infinity])).toEqual([-Infinity, -10]);
		expect(minMax([0])).toEqual([0, 0]);
	})

	test('stddev', () => {
		const arr = [3.1, 6, 48, 39, 1, 5.4, 26, 45, 7.2, 6, 17];
		expect(stdDev(arr)).toBeCloseTo(17.9066);
	})
	test('zScores', () => {
		const arr = [3.1, 6, 48];
		const expected = [-0.63409, -0.51868, 1.15278];
		const result = zScores(arr);
		result.forEach((val, idx) => {
			expect(val).toBeCloseTo(expected[idx], 5);
		})
	})
})