import { validateLine, validateMaxDigitsPerLine, validateThreeInARow } from "@/lib/validate/line";
import { describe, expect, it, test } from "vitest";

describe('line validation functions', () => {
	describe('validateThreeInARow()', () => {
		it('correctly matches three in a row', () => {
			expect(validateThreeInARow('111')).toBe(false);
			expect(validateThreeInARow('000')).toBe(false);
		})

		it('does not match three in a row if not 1 or 0', () => {
			expect(validateThreeInARow('...')).toBe(true);
			expect(validateThreeInARow('222')).toBe(true);
		})
	})

	describe('validateMaxDigitsPerLine()', () => {
		test('correctly returns a valid result', () => {
			expect(validateMaxDigitsPerLine('101010', 3, 3)).toBe(true);
			expect(validateMaxDigitsPerLine('111...', 3, 3)).toBe(true);
		})

		test('correctly finds invalid results', () => {
			expect(validateMaxDigitsPerLine('101011', 3, 3)).toBe(false);
			expect(validateMaxDigitsPerLine('101011')).toBe(false);
			expect(validateMaxDigitsPerLine('000..')).toBe(false);
			expect(validateMaxDigitsPerLine('111...', 4, 2)).toBe(false);
		})
	})

	describe('validateLine()', () => {
		test('correctly checks both max digits and max consecutive', () => {
			expect(validateLine('111...', 3, 3)).toBe(false);
			expect(validateLine('111...', 3, 2)).toBe(false);
			expect(validateLine('111...', 2, 4)).toBe(false);
			expect(validateLine('111...')).toBe(false);

			expect(validateLine('101010', 3, 3)).toBe(true);
			expect(validateLine('101010', 2, 2)).toBe(false);
		})
	})
})