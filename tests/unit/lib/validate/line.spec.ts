import { validateLine, validateBalancedLinesRule, validateMaxConsecutiveRule } from "@/lib/validate/line";
import { describe, expect, it, test } from "vitest";

describe('line validation functions', () => {
	describe('validateMaxConsecutiveRule()', () => {
		it('correctly matches three in a row', () => {
			expect(validateMaxConsecutiveRule('111')).toBe(false);
			expect(validateMaxConsecutiveRule('000')).toBe(false);
			expect(validateMaxConsecutiveRule('...')).toBe(true);
		})

		it('correctly matches three in a row in a longer line', () => {
			expect(validateMaxConsecutiveRule('111111')).toBe(false);
			expect(validateMaxConsecutiveRule('.1110..10.')).toBe(false);
			expect(validateMaxConsecutiveRule('.0110..10.')).toBe(true);
			expect(validateMaxConsecutiveRule('01110100')).toBe(false);
		})

		it('does not match three in a row if not 1 or 0', () => {
			expect(validateMaxConsecutiveRule('...')).toBe(true);
			expect(validateMaxConsecutiveRule('222')).toBe(true);
		})
	})

	describe('validateBalancedLinesRule()', () => {
		test('correctly returns a valid result', () => {
			expect(validateBalancedLinesRule('101010', 3, 3)).toBe(true);
			expect(validateBalancedLinesRule('111...', 3, 3)).toBe(true);
		})

		test('correctly finds invalid results', () => {
			expect(validateBalancedLinesRule('101011', 3, 3)).toBe(false);
			expect(validateBalancedLinesRule('101011')).toBe(false);
			expect(validateBalancedLinesRule('000..')).toBe(false);
			expect(validateBalancedLinesRule('111...', 4, 2)).toBe(false);
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