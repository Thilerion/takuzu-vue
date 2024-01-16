import { getISODay } from 'date-fns';
// TODO: types

export { formatBasicSortableDateKey, formatYYYYMMDD, getDateRange, getDaysAgo, getNextDay, getWeekdayNamesShort, isNextDay, isSameDay } from './date.utilsts';

const padLeft = (num: number, n = 2, value = '0') => `${num}`.padStart(n, value);

export const timeFormatter = (formatOptions: any) => {
	const {
		padMinutes = true,
		msPrecision = null,
	} = formatOptions;

	return (timestampMS = 0) => {
		const fullSeconds = Math.floor(timestampMS / 1000);

		const seconds = padLeft(Math.floor(fullSeconds % 60));
		let _minutes = Math.floor(fullSeconds / 60);
		let minutes: string;
		if (padMinutes) minutes = padLeft(_minutes);
		else minutes = `${_minutes}`;

		let str = `${minutes}:${seconds}`;

		if (msPrecision) {
			const precisionDivider = 1000 / msPrecision;
			const remainingMs = timestampMS - (fullSeconds * 1000);
			const digits = msPrecision <= 10 ? 1 : msPrecision <= 100 ? 2 : 3;
			const msToPrecision = Math.floor(remainingMs / precisionDivider);
			const msToPrecisionDigits = `${msToPrecision}000`.slice(0, digits);
			str += `.${msToPrecisionDigits}`;
		}
		return str;
	}
}

export const formatTimeMMSSss = (timestampMS: number, { padMinutes = true } = {}) => {
	const timestampToPrecision = Math.round(timestampMS / 10) * 10;
	const date = new Date(timestampToPrecision);
	let minutes: string | number = date.getMinutes();
	let seconds: string | number = date.getSeconds();
	let hundredths: string | number = Math.round(date.getMilliseconds() / 10);

	if (padMinutes) {
		minutes = padLeft(minutes);
	}
	seconds = padLeft(seconds);
	hundredths = `00${hundredths}`.slice(-2);
	return `${minutes}:${seconds}.${hundredths}`;
}

export const formatTimeHHMMSS = (timestampMS: number, { padHours = false } = {}) => {
	const totalSeconds = Math.round(timestampMS / 1000);

	const time = new Date(totalSeconds * 1000);

	const hours = time.getHours();
	const minutes = time.getMinutes();
	const seconds = time.getSeconds();

	return `${padHours ? padLeft(hours) : hours}:${padLeft(minutes)}:${padLeft(seconds)}`;
}

export const getMonthNameShort = (date: Date) => {
	const intl = new Intl.DateTimeFormat(undefined, { month: 'short' });
	return intl.format(date).replace('.', '');
}

export const getWeekdayFromDate = (date: Date) => {
	return getISODay(date);
}