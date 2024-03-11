import { expect, test, describe } from 'vitest';
import { EMPTY, ONE, ZERO } from '../../../src/lib/constants';
import { isPuzzleSymbol } from '@/lib/utils/puzzle-value.utils';
import { areLinesEqual } from '@/lib/utils/puzzle-line.utils';
import { getCoordsForBoardSize } from '@/lib/board/Board.helpers';

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
		expect(isPuzzleSymbol(ONE)).toBe(true);
		expect(isPuzzleSymbol(ZERO)).toBe(true);
		expect(isPuzzleSymbol(EMPTY)).toBe(false);
		expect(isPuzzleSymbol(false)).toBe(false);
		expect(isPuzzleSymbol(true)).toBe(false);
	})

	test('are lines equal', () => {
		expect(areLinesEqual(
			// @ts-expect-error testing with numbers
			[1, 2, 3, 4, 5],
			[1, 2, 3, 5, 4]
			)).toBe(false);
			expect(areLinesEqual(
			// @ts-expect-error testing with numbers, booleans, and null
			[true, null, -1, ONE, ZERO, EMPTY],
			[true, null, -1, ONE, ZERO, EMPTY]
		)).toBe(true);
	})
})