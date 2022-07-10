import { describe, expect, it, test } from "vitest";
import { parseTimeMinSec, MINUTE, SECOND, HOUR, formatTimeMMSS, formatTimeMMSSWithRounding } from '../../../src/utils/time.utils';

describe('time utils', () => {
	describe('parseTimeMinSec', () => {
		const baseResult = Object.freeze({
			minutes: 0,
			seconds: 0,
			ms: 0
		})
		it('works with milliseconds only', () => {
			expect(parseTimeMinSec(0)).toEqual({ ...baseResult });
			expect(parseTimeMinSec(10)).toEqual({ ...baseResult, ms: 10 });
			expect(parseTimeMinSec(999)).toEqual({ ...baseResult, ms: 999 });
		})
		it('works with seconds', () => {
			expect(parseTimeMinSec(1000)).toEqual({ ...baseResult, seconds: 1 });
			expect(parseTimeMinSec(2001)).toEqual({ ...baseResult, seconds: 2, ms: 1 });
			expect(parseTimeMinSec(59123)).toEqual({ ...baseResult, seconds: 59, ms: 123 });
		})
		it('works with minutes', () => {
			expect(parseTimeMinSec(60000)).toEqual({...baseResult, minutes: 1})
			expect(parseTimeMinSec(61234)).toEqual({ ...baseResult, minutes: 1, seconds: 1, ms: 234 });
			expect(parseTimeMinSec(HOUR * 2 + MINUTE * 30 + SECOND * 20 + 123)).toEqual({
				...baseResult,
				minutes: 30 + 120,
				seconds: 20,
				ms: 123
			})
		})
	})

	describe('formatTimeMMSS', () => {
		test('with default rounding', () => {
			expect(formatTimeMMSS(200)).toBe('00:00');
			expect(formatTimeMMSS(201)).toBe('00:00');
			expect(formatTimeMMSS(499)).toBe('00:00');
			expect(formatTimeMMSS(500)).toBe('00:01');
			expect(formatTimeMMSS(501)).toBe('00:01');
			expect(formatTimeMMSS(60201)).toBe('01:00');
			expect(formatTimeMMSS(499 + MINUTE * 59)).toBe('59:00');
			expect(formatTimeMMSS(SECOND * 59 + 999 + MINUTE * 59)).toBe('60:00');
			expect(formatTimeMMSS(SECOND * 59 + 500 + MINUTE * 59)).toBe('60:00');
			expect(formatTimeMMSS(SECOND * 59 + 499 + MINUTE * 59)).toBe('59:59');
			expect(formatTimeMMSS(201 + MINUTE * 60)).toBe('60:00');
			expect(formatTimeMMSS(678 + MINUTE * 100)).toBe('100:01');
		})
		test('with custom rounding', () => {
			const fn = formatTimeMMSSWithRounding(200);
			expect(fn(200)).toBe('00:00');
			expect(fn(201)).toBe('00:01');
			expect(fn(499)).toBe('00:01');
			expect(fn(500)).toBe('00:01');
			expect(fn(501)).toBe('00:01');
			expect(fn(60201)).toBe('01:01');
			expect(fn(201 + MINUTE * 59)).toBe('59:01');
			expect(fn(201 + MINUTE * 60)).toBe('60:01');
			expect(fn(201 + MINUTE * 100)).toBe('100:01');
		})
	})
})