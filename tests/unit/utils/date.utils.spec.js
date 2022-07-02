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

	test('formatBasicDDMMYYYY', () => {
		const date = new Date(2021, 4, 19); // 19-5-2021
		expect(dateUtils.formatBasicDDMMYYYY(date)).toBe('19-5-2021');
	})
})