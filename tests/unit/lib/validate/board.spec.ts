import { SimpleBoard } from "@/lib/board/Board.js";
import type { BoardExportString } from "@/lib/types.js";
import { validateBoard } from "@/lib/validate/board.js";

describe('validate board functions', () => {
	test('incomplete square valid board', () => {
		const b = SimpleBoard.import("6x6;0..0..10.1101..1010.1.01..01101..0.1" as BoardExportString);
		expect(validateBoard(b, true)).toBe(true);
	})

	test('complete rectangular valid board', () => {
		const b = SimpleBoard.import("6x10;101010110010010101101001100110010110011001101100010011001101" as BoardExportString);
		expect(validateBoard(b, true)).toBe(true);
	})

	test('incomplete square invalid board with duplicate row', () => {
		const b = SimpleBoard.import("4x4;1010........1010" as BoardExportString);
		expect(validateBoard(b, true)).toBe(false);
		expect(validateBoard(b, false)).toBe(true);
	})

	test('incomplete square valid board where a row is the same as a column', () => {
		const grid = [
			"1...",
			"0...",
			"0...",
			"1001"
		]
		const str = `4x4;${grid.join('')}` as BoardExportString;
		const b = SimpleBoard.import(str);
		expect(validateBoard(b, true)).toBe(true);
		expect(validateBoard(b, false)).toBe(true);
	})

	test('invalid because of max consecutive violation', () => {
		const gridA = [
			'..11..',
			'.....1',
			'11....',
			'......'
		].join('');
		const gridB = [
			'11....',
			'......',
			'111...',
			'......'
		].join('');
		const strA = `6x4;${gridA}` as BoardExportString;
		const strB = `6x4;${gridB}` as BoardExportString;
		expect(validateBoard(SimpleBoard.import(strA))).toBe(true);
		expect(validateBoard(SimpleBoard.import(strB))).toBe(false);
	})

	test('invalid because of max per line violation', () => {
		const str = '4x4;.0.......0...0..' as BoardExportString;
		expect(validateBoard(SimpleBoard.import(str))).toBe(false);
	})

	test('invalid because a line matches more than 1 other line', () => {
		const str = '6x6;101010......101010............101010' as BoardExportString;
		expect(validateBoard(SimpleBoard.import(str))).toBe(false);
	})
})