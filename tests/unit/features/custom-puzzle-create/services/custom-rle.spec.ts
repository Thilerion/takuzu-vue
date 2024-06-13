import { decodeCustomPuzzleStringRLE, toCustomPuzzleStringRLE } from "@/features/puzzle-editor/services/string-conversions/custom-rle.js"

describe('customPuzzlestringRLE representation', () => {
	describe('encode and decode combined', () => {
		test('encoding then decoding should return the original string', () => {
			const testCases = [
				'110..1.0....110.', //4x4
				'1100011000111001', //4x4 filled
				'................', //4x4 empty
				'00111100001..010', //4x4 random
			];
			const encoded = testCases.map((val) => toCustomPuzzleStringRLE(val, false));
			const decoded = encoded.map((val) => decodeCustomPuzzleStringRLE(val));
			expect(decoded).toEqual(testCases);
		})

		test('encoding then decoding should return the original string when the empty end is excluded in encoding', () => {
			const testCases = [
				'110..1.0....110.', //4x4
				'1100011000111001', //4x4 filled
				'................', //4x4 empty
				'00111100001..010', //4x4 random
			];
			const encoded = testCases.map((val) => toCustomPuzzleStringRLE(val, true));
			const decoded = encoded.map((val) => decodeCustomPuzzleStringRLE(val, 16));
			expect(decoded).toEqual(testCases);
		})
	})

	describe('toCustomPuzzleStringRLE', () => {
		it('should return the correct RLE string for a partially filled board', () => {
			const testCases = [
				['00111..10......10.....1..0000..10..', '27b51f51e5b4b51b'], // 6x6
				['0.1111..........', '1a8j']
			]

			for (const [input, expected] of testCases) {
				const result = toCustomPuzzleStringRLE(input);
				expect(result).toEqual(expected);
			}
		})

		it('should return the correct RLE string for an empty board, with and without excluding the empty end', () => {
			expect(
				toCustomPuzzleStringRLE('................', false), // 16; 4x4
			).toEqual('p');
			expect(
				toCustomPuzzleStringRLE('................', true), // 16; 4x4
			).toEqual('');
		})

		it('should correctly encode runs of empty cells', () => {
			expect(toCustomPuzzleStringRLE('.'.repeat(1))).toEqual('a');
			expect(toCustomPuzzleStringRLE('.'.repeat(25))).toEqual('y');
			expect(toCustomPuzzleStringRLE('.'.repeat(26))).toEqual('z');
			expect(toCustomPuzzleStringRLE('.'.repeat(27))).toEqual('za');
			expect(
				toCustomPuzzleStringRLE('.'.repeat(121), false) // 121; 11x11
			).toEqual('zzzzq'); // 4 * 26 (z) + 17 (q)
		})

		it('throws an error when there are invalid characters in the input string', () => {
			expect(() => toCustomPuzzleStringRLE('1.02' as any)).toThrow();
			expect(() => toCustomPuzzleStringRLE('1.0 ' as any)).toThrow();
			expect(() => toCustomPuzzleStringRLE('1.0.x' as any)).toThrow();
		})
	})

	describe('decodeCustomPuzzleStringRLE', () => {
		it('correctly decodes a RLE string containing only empty cells', () => {
			expect(decodeCustomPuzzleStringRLE('p')).toEqual('................');
			expect(decodeCustomPuzzleStringRLE('z')).toEqual('.'.repeat(26));
			expect(decodeCustomPuzzleStringRLE('za')).toEqual('.'.repeat(27));
			expect(decodeCustomPuzzleStringRLE('zzzzq')).toEqual('.'.repeat(121));
		})
		
		it('correctly handles an RLE string with the empty end excluded if the board length is provided', () => {
			expect(decodeCustomPuzzleStringRLE('', 16)).toEqual('.'.repeat(16));
			expect(decodeCustomPuzzleStringRLE('a151', 16)).toEqual('.010' + '.'.repeat(12));
		})

		it('correctly decodes a RLE string from a partially filled board', () => {
			expect(decodeCustomPuzzleStringRLE('1a8j')).toEqual('0.1111..........');
		})

		it('throws an error if the provided boardStringLength is smaller than the decoded string', () => {
			expect(() => decodeCustomPuzzleStringRLE('z8', 15)).toThrow();
		})
	})
})