import { expect, test, describe } from 'vitest';
import { EMPTY, ONE, ZERO } from '../../../src/lib/constants';
import { getCoordsForBoardSize, isValidCellDigit, areLinesEqual } from '../../../src/lib/utils';

describe('board and puzzle utils', () => {
	
	describe('getCoordsForBoardSize', () => {

		test('returns correct coordinates', () => {
			const expected = [
				{ x: 0, y: 0 },
				{ x: 1, y: 0 },
				{ x: 2, y: 0 },
				{ x: 0, y: 1 },
				{ x: 1, y: 1 },
				{ x: 2, y: 1 },
			];
			const result = getCoordsForBoardSize(3, 2);
			expect(result).toEqual(expected);
		})

		test('is memoized', () => {
			const firstResult = getCoordsForBoardSize(4, 5);
			const secondResult = getCoordsForBoardSize(4, 5);

			expect(firstResult).toBe(secondResult);
			expect(firstResult[0]).toBe(secondResult[0]);
		})

	})

	test('isValidCellDigit', () => {
		expect(isValidCellDigit(ONE)).toBe(true);
		expect(isValidCellDigit(ZERO)).toBe(true);
		expect(isValidCellDigit(EMPTY)).toBe(false);
		expect(isValidCellDigit(false)).toBe(false);
		expect(isValidCellDigit(true)).toBe(false);
	})

	test('are lines equal', () => {
		expect(areLinesEqual(
			[1, 2, 3, 4, 5],
			[1, 2, 3, 5, 4]
		)).toBe(false);
		expect(areLinesEqual(
			[true, null, -1, ONE, ZERO, EMPTY],
			[true, null, -1, ONE, ZERO, EMPTY]
		)).toBe(true);
	})
})