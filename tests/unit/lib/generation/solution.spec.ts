import { generateSolutionBoard, getInitialFillData, getInitialLinesToFill } from '@/lib/generation/solution.js';
import { SimpleBoard } from '@/lib/board/Board.js';
import seedrandom from 'seedrandom';
import { COLUMN, ROW } from '@/lib/constants.js';
import { isLineIdColumn, isLineIdRow } from '@/lib/utils/puzzle-line.utils.js';
import type { LineId } from '@/lib/types.js';

describe('generateSolutionBoard', () => {
	const origRandom = Math.random;
	beforeEach(() => {
		Math.random = seedrandom('test', { global: false });
	})
	afterAll(() => {
		Math.random = origRandom;
	})

	it('can generate all (72) possible 4x4 boards', () => {
		const boards = new Set<string>();
		// should work in 1000 attempts or less
		for (let i = 0; i < 1000; i++) {
			const board = generateSolutionBoard(4, 4, 1);
			if (board) {
				boards.add(board.toBoardString());
			}
			if (boards.size >= 72) {
				break;
			}
		}
		expect(boards.size).toBe(72);
	})

	it('correctly generates a valid, filled small (4x4) board', () => {
		const result = generateSolutionBoard(4, 4, 1);
		expect(result).toBeInstanceOf(SimpleBoard);
		expect(result!.toDisplayString()).toMatchInlineSnapshot(`
			"1001
			1100
			0110
			0011"
		`);
		expect(result?.isSolved()).toBe(true);
	})
	it('correctly generates a valid, filled 9x9 board (odd)', () => {
		const result = generateSolutionBoard(9, 9, 1);
		expect(result).toBeInstanceOf(SimpleBoard);
		expect(result!.toDisplayString()).toMatchInlineSnapshot(`
			"011011010
			110100110
			101101001
			011010110
			100101101
			101010011
			010110110
			010101101
			101011001"
		`);
		expect(result?.isSolved()).toBe(true);
	})

	it('correctly generates a valid, filled, 10x14 board (rectangular)', () => {
		const result = generateSolutionBoard(10, 14, 1);
		expect(result).toBeInstanceOf(SimpleBoard);
		expect(result!.toDisplayString()).toMatchInlineSnapshot(`
			"1101100100
			1100101001
			0010011011
			1001100110
			0110011001
			1100101010
			0011010101
			1101010010
			0010101101
			1011010100
			0101011010
			1010100101
			0010110110
			0101001011"
		`);
		expect(result!.width).toBe(10);
		expect(result!.height).toBe(14);
		expect(result?.isSolved()).toBe(true);
	})

	it('correctly generates a valid, filled, 14x14 board (square)', () => {
		const result = generateSolutionBoard(14, 14, 1);
		expect(result).toBeInstanceOf(SimpleBoard);
		expect(result!.toDisplayString()).toMatchInlineSnapshot(`
			"11011001100100
			11001010100101
			00110101011010
			10011010100101
			01100110011001
			01101001010110
			10010010101011
			11010100110100
			00101101010011
			10101011001010
			01010110101100
			00110100110101
			11001011001010
			00100101011011"
		`);
		expect(result!.width).toBe(14);
		expect(result!.height).toBe(14);
		expect(result?.isSolved()).toBe(true);
	})
})

describe('getInitialFillData', () => {
	describe('axis', () => {
		test('it fills entire rows when width is smaller than height', () => {
			const result = getInitialFillData(8, 12);
			expect(result.axis).toBe(ROW);
			expect(isLineIdRow(result.linesToFill[0])).toBe(true);
			expect(result.possibleLines[0]).toHaveLength(8);
		})

		test('it fills entire columns when height is smaller', () => {
			const result = getInitialFillData(12, 8);
			expect(result.axis).toBe(COLUMN);
			expect(isLineIdColumn(result.linesToFill[0])).toBe(true);
			expect(result.possibleLines[0]).toHaveLength(8);
		})
	})

	describe('linesToFill', () => {
		test('it never chooses the first and last lines, and starts at the second line', () => {
			const lineFirst = '1';
			const lineFilled = '2';
			const results = new Map<number, LineId[]>();
			for (let i = 4; i < 14; i++) {
				const result = getInitialLinesToFill(COLUMN, { width: i, height: i });
				expect(result).not.toContain(lineFirst);
				expect(result).not.toContain(`${i}`);
				expect(result).toContain(lineFilled);
				results.set(i, result);
			}
		})

		test('it always leaves 2 empty lines between each filled line', () => {
			const result = getInitialLinesToFill(ROW, { width: 8, height: 14 });
			expect(result).toEqual(['B', 'E', 'H', 'K']); // 1, 4, 7, 10; NOT 13 as it is the last line
		})
	})
})