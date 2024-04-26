import { EMPTY, ONE, ZERO } from '../../../src/lib/constants.js';
import { isPuzzleSymbol } from '@/lib/utils/puzzle-value.utils.js';
import { generateBoardCoords } from '@/lib/board/Board.helpers.js';

describe('board and puzzle utils', () => {
	
	describe('generateBoardCoords', () => {

		test('returns correct coordinates', () => {
			const expected = [
				{ x: 0, y: 0 },
				{ x: 1, y: 0 },
				{ x: 2, y: 0 },
				{ x: 0, y: 1 },
				{ x: 1, y: 1 },
				{ x: 2, y: 1 },
			];
			const result = generateBoardCoords(3, 2);
			expect(result).toEqual(expected);
		})

		test('is memoized', () => {
			const firstResult = generateBoardCoords(4, 5);
			const secondResult = generateBoardCoords(4, 5);

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
})