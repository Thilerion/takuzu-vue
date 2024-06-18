import { charToNum, decodeCustomPuzzleStringRleWithDims, encodeEmptyRunLength, isPotentialCustomPuzzleStringRleWithDims, numToChar, toCustomPuzzleStringRleWithDims } from "@/features/puzzle-editor/services/string-conversions/custom-rle.js"

describe('custom-rle with dims', () => {
	describe('numToChar and charToNum', () => {
		test('numToChar works', () => {
			expect(numToChar(1)).toBe('a');
			expect(numToChar(2)).toBe('b');
			expect(numToChar(26)).toBe('z');
		})

		test('numToChar throws for invalid input', () => {
			expect(() => numToChar(0)).toThrow();
			expect(() => numToChar(27)).toThrow();
		})

		test('charToNum works', () => {
			expect(charToNum('a')).toBe(1);
			expect(charToNum('b')).toBe(2);
			expect(charToNum('z')).toBe(26);
		})

		test('charToNum throws for invalid input', () => {
			expect(() => charToNum('')).toThrow();
			expect(() => charToNum('A')).toThrow();
			expect(() => charToNum('6')).toThrow();
			expect(() => charToNum('aa')).toThrow();
		})
	})

	describe('encodeEmptyRunLength', () => {
		it('works', () => {
			expect(encodeEmptyRunLength(1)).toBe('a');
			expect(encodeEmptyRunLength(2)).toBe('b');
			expect(encodeEmptyRunLength(26)).toBe('z');
			expect(encodeEmptyRunLength(27)).toBe('za');
			expect(encodeEmptyRunLength(55)).toBe('zzc');
		})
	})

	describe('toCustomPuzzleStringRleWithDims', () => {
		it('works with a partially filled board', () => {
			expect(toCustomPuzzleStringRleWithDims(
				'0.1111..........',
				{ width: 4, height: 4 }
			)).toBe('d/1a8j');

			expect(toCustomPuzzleStringRleWithDims(
				'00111..10......10.....1..0000..10..',
				{ width: 6, height: 6 }
			)).toBe('f/27b51f51e5b4b51b');
		})

		it('throws an error when there are invalid characters in the input string', () => {
			expect(() => toCustomPuzzleStringRleWithDims('1.02' as any, { width: 2, height: 2 })).toThrow();
			expect(() => toCustomPuzzleStringRleWithDims('1.0 ' as any, { width: 2, height: 2 })).toThrow();
			expect(() => toCustomPuzzleStringRleWithDims('1.0.x' as any, { width: 3, height: 2 })).toThrow();
		})
	})

	describe('encode and decode combined', () => {
		test('encoding then decoding should return the original string', () => {
			const testCases = [
				'110..1.0....110.', //4x4
				'1100011000111001', //4x4 filled
				'................', //4x4 empty
				'00111100001..010', //4x4 random
			];
			const encoded = testCases.map((val) => toCustomPuzzleStringRleWithDims(val, { width: 4, height: 4 }));
			const decoded = encoded.map((val) => decodeCustomPuzzleStringRleWithDims(val));
			expect(decoded.map(v => v.board)).toEqual(testCases);
		})
	})

	test('isPotentialCustomPuzzleStringRleWithDims', () => {
		expect(isPotentialCustomPuzzleStringRleWithDims('a/1a8j')).toBe(true);
		expect(isPotentialCustomPuzzleStringRleWithDims('bc/1a8j')).toBe(true);
		
		expect(isPotentialCustomPuzzleStringRleWithDims('1a8j')).toBe(false);
		expect(isPotentialCustomPuzzleStringRleWithDims('1/fd')).toBe(false);
		expect(isPotentialCustomPuzzleStringRleWithDims('1/1a8!j')).toBe(false);
		expect(isPotentialCustomPuzzleStringRleWithDims('1/1a8/j')).toBe(false);
	})
})