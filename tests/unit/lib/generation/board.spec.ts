import { SimpleBoard, generateBoard } from '@/lib/index.js';
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
			const board = generateBoard(4, 4, 1);
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
		const result = generateBoard(4, 4, 1);
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
		const result = generateBoard(9, 9, 1);
		expect(result).toBeInstanceOf(SimpleBoard);
		expect(result!.toDisplayString()).toMatchInlineSnapshot(`
			"011011010
			110100110
			101101001
			011010110
			100110011
			101001101
			010110110
			101011001
			010101101"
		`);
		expect(result?.isSolved()).toBe(true);
	})

	it('correctly generates a valid, filled, 10x14 board (rectangular)', () => {
		const result = generateBoard(10, 14, 1);
		expect(result).toBeInstanceOf(SimpleBoard);
		expect(result!.toDisplayString()).toMatchInlineSnapshot(`
			"1100100110
			1100101001
			0011011010
			1001100110
			0110011001
			1001001011
			0110110100
			1101010010
			1010101001
			0011010110
			0101100101
			1010011010
			0011010101
			0100101101"
		`);
		expect(result!.width).toBe(10);
		expect(result!.height).toBe(14);
		expect(result?.isSolved()).toBe(true);
	})

	it('correctly generates a valid, filled, 14x14 board (square)', () => {
		const result = generateBoard(14, 14, 1);
		expect(result).toBeInstanceOf(SimpleBoard);
		expect(result!.toDisplayString()).toMatchInlineSnapshot(`
			"11001010110010
			11001010100101
			00110101011001
			10011001100110
			01100110011001
			10010010110110
			01101001001011
			11010100110100
			10101011001100
			00110101001011
			01010110110010
			10101011010100
			00110100101011
			01001101001101"
		`);
		expect(result!.width).toBe(14);
		expect(result!.height).toBe(14);
		expect(result?.isSolved()).toBe(true);
	})
})