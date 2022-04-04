import { expect, it, beforeEach, test, describe } from 'vitest';
import { EMPTY, ONE, ZERO } from '../../../src/lib/constants';
import { getCoordsForBoardSize, isValidCellDigit, areLinesEqual, deducePuzzleDimensionsFromLength, isExportString } from '../../../src/lib/utils';

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

	describe('isExportString', () => {
		test('matches export string', () => {
			expect(isExportString('10x12;01010..')).toBe(true);
		})
		test('is false for other strings', () => {
			expect(isExportString('01001..101010...101.10')).toBe(false);
		})
		test('requires values after the dimensions', () => {
			expect(isExportString('10x12;')).toBe(false);
			expect(isExportString('10x12;010')).toBe(false);
			expect(isExportString('10x12;....')).toBe(true);
		})
		test('requires proper dimensions', () => {
			expect(isExportString('@x@;....')).toBe(false);
			expect(isExportString('x;....')).toBe(false);
			expect(isExportString('1x1;....')).toBe(true);
		})
		test('works multiple times', () => {
			const strA = '10x12;01010101....';

			const resultA = isExportString(strA);
			const resultB = isExportString(strA);
			expect(resultA).toBe(true);
			expect(resultA).toBe(resultB);
		})
		test('is false for strings with additional characters after board string', () => {
			const baseStr = '6x6;1010..1010';
			expect(isExportString(baseStr + ';')).toBe(false);
			expect(isExportString(baseStr + '2')).toBe(false);
			expect(isExportString(baseStr + '..10')).toBe(true);
			expect(isExportString(baseStr + ' ')).toBe(false);
		})
	})

	describe('deducePuzzleDimensionsFromLength', () => {
		test('width odd line length', () => {
			const expectVal = (size) => ({ width: size, height: size });
			expect(deducePuzzleDimensionsFromLength(11 * 11)).toStrictEqual(expectVal(11));
			expect(deducePuzzleDimensionsFromLength(5 * 5)).toStrictEqual(expectVal(5));
			expect(deducePuzzleDimensionsFromLength(1 * 1)).toStrictEqual(expectVal(1));
		})

		test('with square size', () => {
			const expectVal = (size) => ({ width: size, height: size });
			expect(deducePuzzleDimensionsFromLength(2 * 2)).toStrictEqual(expectVal(2));
			expect(deducePuzzleDimensionsFromLength(10 * 10)).toStrictEqual(expectVal(10));
			expect(deducePuzzleDimensionsFromLength(16 * 16)).toStrictEqual(expectVal(16));
			expect(deducePuzzleDimensionsFromLength(20 * 20)).toStrictEqual(expectVal(20));

			const diffA = deducePuzzleDimensionsFromLength(16 * 10);
			expect(diffA.width).not.toBeCloseTo(diffA.height);
		})

		test('with rectangular size', () => {
			const expectVal = (width, height) => ({ width, height });

			expect(deducePuzzleDimensionsFromLength(10 * 16)).toStrictEqual(expectVal(10, 16));
			expect(deducePuzzleDimensionsFromLength(12 * 16)).toStrictEqual(expectVal(12, 16));
			expect(deducePuzzleDimensionsFromLength(4 * 14)).toStrictEqual(expectVal(4, 14));
			expect(deducePuzzleDimensionsFromLength(6 * 10)).toStrictEqual(expectVal(6, 10));

			expect(() => deducePuzzleDimensionsFromLength(11 * 12)).toThrow();
		})

		test('with conflictign rectangular size', () => {
			// can be 8x12, but also 6x16
			const result96A = deducePuzzleDimensionsFromLength(8 * 12);
			const result96B = deducePuzzleDimensionsFromLength(6 * 16);

			expect(result96B).toStrictEqual(result96A);
			expect(result96A).toStrictEqual({ width: 8, height: 12 });

			const result48A = deducePuzzleDimensionsFromLength(6 * 8);
			const result48B = deducePuzzleDimensionsFromLength(4 * 12);

			expect(result48A).toStrictEqual(result48B);
			expect(result48A).toStrictEqual({ width: 6, height: 8 });
		})
	})
})