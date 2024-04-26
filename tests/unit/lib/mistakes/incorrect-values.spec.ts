import { ZERO, ONE } from "@/lib/constants.js";
import { SimpleBoard } from "@/lib/board/Board.js";
import { findIncorrectValuesFromSolution, hasIncorrectValues } from "@/lib/mistakes/incorrect-values.js";
import type { BoardExportString } from "@/lib/types.js";

describe('incorrect-values', () => {
	describe('hasIncorrectValues()', () => {
		it('returns true when there are incorrect values on the board, compared to the solution', () => {
			const board = 		SimpleBoard.fromString('6x10;.10.000101010.00.11.00..1..010001101011010..010101.0.1101...' as BoardExportString);
			const solution = 	SimpleBoard.fromString('6x10;110100010101001011101100110010001101011010100101010011101010' as BoardExportString);
			const result = hasIncorrectValues({ board, solution });
			expect(result).toBe(true);
		})
		it('returns false when there are no incorrect values', () => {
			const board = 		SimpleBoard.fromString('6x10;11.1000.010.0.....1100.01.1.000100..10.001010..00...011..0.0' as BoardExportString);
			const solution = 	SimpleBoard.fromString('6x10;110100010101001011110010101100010011101001010110001101101010' as BoardExportString);
			const result = hasIncorrectValues({ board, solution });
			expect(result).toBe(false);
		})
		it('returns false when the puzzle board is equal to the solution board', () => {
			const board = 		SimpleBoard.fromString('6x10;110100010101001011101100110010001101011010100101010011101010' as BoardExportString);
			const solution = 	SimpleBoard.fromString('6x10;110100010101001011101100110010001101011010100101010011101010' as BoardExportString);
			const result = hasIncorrectValues({ board, solution });
			expect(result).toBe(false);
		})
		it('returns false when the puzzle board is empty', () => {
			const board = 		SimpleBoard.fromString('6x10;............................................................' as BoardExportString);
			const solution = 	SimpleBoard.fromString('6x10;110100010101001011101100110010001101011010100101010011101010' as BoardExportString);
			const result = hasIncorrectValues({ board, solution });
			expect(result).toBe(false);
		})
	})

	describe('findIncorrectValuesFromSolution()', () => {
		it('returns an empty results array when there are no incorrect values', () => {
			const board = 		SimpleBoard.fromString('6x10;11.1000.010.0.....1100.01.1.000100..10.001010..00...011..0.0' as BoardExportString);
			const solution = 	SimpleBoard.fromString('6x10;110100010101001011110010101100010011101001010110001101101010' as BoardExportString);
			const result = findIncorrectValuesFromSolution({ board, solution });
			expect(result).toEqual({ hasMistakes: false, results: [] });
		})
		it('returns an array of incorrect values when there are incorrect values', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'01...1',
				'.....0',
				'..0.1.',
				'0.....',
				'.1.0..',
				'.1.0..'
			])
			const solution = SimpleBoard.fromArrayOfLines([
				'110100',
				'101100',
				'010011',
				'001101',
				'110010',
				'001011'
			])
			const result = findIncorrectValuesFromSolution({ board, solution });
			expect(result.results).toHaveLength(3);
			expect(result.results).toContainEqual({ x: 0, y: 0, current: ZERO, correctValue: ONE });
			expect(result.results).toContainEqual({ x: 5, y: 0, current: ONE, correctValue: ZERO });
			expect(result.results).toContainEqual({ x: 1, y: 5, current: ONE, correctValue: ZERO });
			expect(result.hasMistakes).toBe(true);
		})
	})
});