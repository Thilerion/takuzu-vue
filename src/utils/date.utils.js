import { getISODay } from 'date-fns/esm';

export { formatBasicSortableDateKey, formatYYYYMMDD, getDateRange, getDaysAgo, getNextDay, getWeekdayNamesShort, isNextDay, isSameDay } from './date.utilsts';

const padLeft = (num, n = 2, value = '0') => `${num}`.padStart(n, value);

export const timeFormatter = (formatOptions) => {
	const {
		padMinutes = true,
		msPrecision = null,
	} = formatOptions;

	return (timestampMS = 0) => {
		const fullSeconds = Math.floor(timestampMS / 1000);

		const seconds = padLeft(Math.floor(fullSeconds % 60));
		let minutes = Math.floor(fullSeconds / 60);
		if (padMinutes) minutes = padLeft(minutes);

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

export const formatTimeMMSSss = (timestampMS, { padMinutes = true } = {}) => {
	const timestampToPrecision = Math.round(timestampMS / 10) * 10;
	const date = new Date(timestampToPrecision);
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();
	let hundredths = Math.round(date.getMilliseconds() / 10);
	
	if (padMinutes) {
		minutes = padLeft(minutes);
	}
	seconds = padLeft(seconds);
	hundredths = `00${hundredths}`.slice(-2);
	return `${minutes}:${seconds}.${hundredths}`;
}

export const formatTimeHHMMSS = (timestampMS, { padHours = false } = {}) => {
	const totalSeconds = Math.round(timestampMS / 1000);
	
	const time = new Date(totalSeconds * 1000);

	const hours = time.getHours();
	const minutes = time.getMinutes();
	const seconds = time.getSeconds();	

	return `${padHours ? padLeft(hours) : hours}:${padLeft(minutes)}:${padLeft(seconds)}`;
}

export const getMonthNameShort = (date) => {
	const intl = new Intl.DateTimeFormat(undefined, { month: 'short' });
	return intl.format(date).replace('.', '');
}

export const getWeekdayFromDate = (date) => {
	return getISODay(date);
}