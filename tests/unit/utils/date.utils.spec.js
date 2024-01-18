import { expect, test, describe } from 'vitest';
import * as dateUtils from '@/utils/date.utils.js';

describe('date utilities', () => {
	test('isSameDay', () => {
		expect(dateUtils.isSameDay(new Date(), new Date())).toBe(true);

		const dateA = new Date('2011-10-10T00:00:01');
		const dateB = new Date('2011-10-09T23:59:59');
		const dateC = new Date('2011-10-09T00:00:01');

		expect(dateUtils.isSameDay(dateA, dateB)).toBe(false);
		expect(dateUtils.isSameDay(dateA, dateC)).toBe(false);
		expect(dateUtils.isSameDay(dateB, dateC)).toBe(true);
	})

	test('isNextDay', () => {
		expect(dateUtils.isNextDay(new Date(), new Date())).toBe(false);

		const dateA = new Date('2011-10-10T00:00:01');
		const dateB = new Date('2011-10-09T23:59:59');

		expect(dateUtils.isNextDay(dateA, dateB)).toBe(false);
		expect(dateUtils.isNextDay(dateB, dateA)).toBe(true);
	})

	test('formatBasicSortableDateKey', () => {
		const dateA = new Date('1995-12-17T03:24:00');
		expect(dateUtils.formatBasicSortableDateKey(dateA)).toBe('1995-12-17');

		const dateB = new Date(2022, 0, 2, 12, 32, 33, 340);
		expect(dateUtils.formatBasicSortableDateKey(dateB)).toBe('2022-01-02');
	})

	test('formatYYYYMMDD', () => {
		const dateAStr = '1995-12-17T03:24:00'
		const dateA = new Date(dateAStr);
		const timestampA = dateA.valueOf();
		const expectedA = '1995-12-17';
		expect(dateUtils.formatYYYYMMDD(dateA)).toBe(expectedA);
		expect(dateUtils.formatYYYYMMDD(dateAStr)).toBe(expectedA);
		expect(dateUtils.formatYYYYMMDD(timestampA)).toBe(expectedA);

		const dateB = new Date(2022, 0, 2, 12, 32, 33, 340);
		const dateBStr = dateB.toISOString();
		const timestampB = dateB.valueOf();
		const expectedB = '2022-01-02';
		expect(dateUtils.formatYYYYMMDD(dateB)).toBe(expectedB);
		expect(dateUtils.formatYYYYMMDD(dateBStr)).toBe(expectedB);
		expect(dateUtils.formatYYYYMMDD(timestampB)).toBe(expectedB);
	})

	describe.skip('getDateRange()', () => {
		test('returns range from specific date to today', () => {
			const today = new Date();
			const twoDaysAgo = dateUtils.getDaysAgo(today, 2);

			const result = dateUtils.getDateRange(twoDaysAgo);
			expect(result).toHaveLength(3);
			expect(result[0]).toEqual(twoDaysAgo);
			expect(result[1]).toEqual(dateUtils.getNextDay(twoDaysAgo));
			expect(result[2]).toEqual(today);
		})

		test('can be used without last including end', () => {
			const dateA = new Date(2022, 0, 1, 12, 0, 0);
			const dateB = new Date(2022, 0, 4, 12, 0, 0);

			expect(dateUtils.getDateRange(dateA, dateB)).toHaveLength(4);
			expect(dateUtils.getDateRange(dateA, dateB, { includeEnd: false })).toHaveLength(3);
		})
	})

	describe('getWeekdayNamesShort()', () => {
		test('Nederlands; starting with monday', () => {
			const result = dateUtils.getWeekdayNamesShort({
				locales: 'nl-nl',
			});
			expect(result).toMatchInlineSnapshot(`
				[
				  "zo",
				  "ma",
				  "di",
				  "wo",
				  "do",
				  "vr",
				  "za",
				]
			`);
		})

		test('English; starting with sunday', () => {
			const result = dateUtils.getWeekdayNamesShort({
				locales: ['en-US'],
				weekStartsOn: 'sunday'
			});
			expect(result).toMatchInlineSnapshot(`
				[
				  "Sun",
				  "Mon",
				  "Tue",
				  "Wed",
				  "Thu",
				  "Fri",
				  "Sat",
				]
			`);
		})
	})
})