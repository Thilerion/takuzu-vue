import { importCustomPuzzleString, type ParsedCustomPuzzleString } from "@/features/puzzle-editor/services/string-conversions/import.js";
import type { BoardExportString, BoardString } from "@/lib/types.js"

describe('import custom puzzle string', () => {
	it('can import a BoardString', () => {
		const boardString = '0..1..1.0.10....' as BoardString;
		const result = importCustomPuzzleString(boardString);
		expect(result).toMatchObject({
			success: true,
			width: 4,
			height: 4,
			type: 'BoardString'
		})
		expect((result as ParsedCustomPuzzleString).grid.flat().join('')).toBe(boardString);
	})

	it('can import a BoardExportString', () => {
		const boardStr = '0..1....1...0.10........';
		const str = `6x4;${boardStr}` as BoardExportString;
		const result = importCustomPuzzleString(str);
		expect(result).toMatchObject({
			success: true,
			width: 6,
			height: 4,
			type: 'BoardExportString'
		})
		expect((result as ParsedCustomPuzzleString).grid.flat().join('')).toBe(boardStr);
	})

	it('can import a CustomLong string', () => {
		const str = '0..1.. ..1... 0.10.. ......';
		const result = importCustomPuzzleString(str);
		expect(result).toMatchObject({
			success: true,
			width: 6,
			height: 4,
			type: 'CustomLong'
		})
		expect((result as ParsedCustomPuzzleString).grid.flat().join('')).toBe('0..1....1...0.10........');
	})

	it('can import a CustomRLE string', () => {
		const result = importCustomPuzzleString('fd/1b5d5c1a51h');
		expect(result).toMatchObject({
			success: true,
			width: 6,
			height: 4,
			type: 'CustomRLE'
		})
		expect((result as ParsedCustomPuzzleString).grid.flat().join('')).toBe('0..1....1...0.10........');
	})
})