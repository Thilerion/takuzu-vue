import { addDays, isSameDay } from 'date-fns';
import { eachDayOfInterval, endOfWeek, format, getISODay, startOfWeek } from 'date-fns/esm';

export { isSameDay };

export const getNextDay = date => {
	return addDays(date, 1);
}

export const isNextDay = (dateA, dateB) => {
	const nextDay = getNextDay(dateA);
	return isSameDay(dateB, nextDay);
}

export const formatBasicDDMMYYYY = (date) => {
	return new Date(date).toLocaleDateString('nl');
}
export const formatBasicSortableDateKey = (date) => {
	const d = new Date(date);
	return [
		d.getFullYear(),
		`00${d.getMonth() + 1}`.slice(-2),
		`00${d.getDate()}`.slice(-2),
	].join('-');
}
export const formatYYYYMMDD = dateOrTimestamp => {
	const date = new Date(dateOrTimestamp);
	return [
		`${date.getFullYear()}`,
		`00${date.getMonth() + 1}`.slice(-2),
		`00${date.getDate()}`.slice(-2),
	].join('-');
}

export const getDateRange = (startDate, endDate = new Date()) => {
	const arr = [];
	for (let d = startDate; d <= endDate; d = getNextDay(d)) {
		arr.push(d);
	}
	return arr;
}

const padLeft = (num) => `0${num}`.slice(-2);

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
			let remainingMs = timestampMS - (fullSeconds * 1000);
			const digits = msPrecision <= 10 ? 1 : msPrecision <= 100 ? 2 : 3;
			let msToPrecision = Math.floor(remainingMs / precisionDivider);
			let msToPrecisionDigits = `${msToPrecision}000`.slice(0, digits);
			str += `.${msToPrecisionDigits}`;
		}
		return str;
	}
}

export const formatTimeMMSS = (timestampMS, {
	padMinutes = true,
} = {}) => {
	let totalSeconds = timestampMS / 1000;
	const remainingMS = timestampMS % 1000;
	if (remainingMS <= 200) {
		totalSeconds = Math.floor(totalSeconds);
	} else totalSeconds = Math.ceil(totalSeconds);

	const seconds = totalSeconds % 60;
	const minutes = (totalSeconds - seconds) / 60;

	return `${padMinutes ? padLeft(minutes) : minutes}:${padLeft(seconds)}`;
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

export const getWeekDaysShort = ({
	weekStartsOn = 1, // 1 for monday
} = {}) => {
	const now = new Date();
	const weekdays = [];

	const start = startOfWeek(now, { weekStartsOn });
	const end = endOfWeek(now, { weekStartsOn });

	const intl = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
	eachDayOfInterval({ start, end }).forEach(day => {
		weekdays.push(
			intl.format(day)
		)
	})
	return weekdays;
}

export const getMonthNameShort = (date) => {
	const intl = new Intl.DateTimeFormat(undefined, { month: 'short' });
	return intl.format(date).replace('.', '');
}

export const getWeekdayFromDate = (date) => {
	return getISODay(date);
}