import { generateSolutionBoard } from '@/lib/generation/solution.js';
import { SimpleBoard } from '@/lib/board/Board.js';
import seedrandom from 'seedrandom';

describe('generateBoard', () => {
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