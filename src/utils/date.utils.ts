import { getISODay, addDays, eachDayOfInterval, endOfWeek, isSameDay, startOfWeek, subDays } from 'date-fns';
// TODO: types, currently uses "any"

const padLeft = (num: number, n = 2, value = '0') => `${num}`.padStart(n, value);
type Timestamp = number;

export const getNextDay = (date: Date | Timestamp) => {
	return addDays(date, 1);
}
export const isNextDay = (
	left: Date | Timestamp,
	right: Date | Timestamp
) => {
	const nextLeft = getNextDay(left);
	return isSameDay(right, nextLeft);
}
export const getDaysAgo = (date: Date | Timestamp, n: number) => {
	return subDays(date, n);
}

export const formatYYYYMMDD = (
	date: Date | Timestamp | string,
	separator = '-'
) => {
	const d = new Date(date);
	return [
		d.getFullYear(),
		`00${d.getMonth() + 1}`.slice(-2),
		`00${d.getDate()}`.slice(-2),
	].join(separator);
}

export const formatBasicSortableDateKey = (date: Date) => {
	return formatYYYYMMDD(date, '-');
}

interface GetDateRangeOpts {
	includeEnd?: boolean
}
export const getDateRange = (
	start: Date,
	end = new Date(),
	opts: GetDateRangeOpts = { includeEnd: true }
) => {
	const arr = [];
	for (let current = start; current < end; current = getNextDay(current)) {
		arr.push(current);
	}
	if (opts.includeEnd) {
		const last = arr.at(-1);
		if (last) arr.push(getNextDay(last));
	}
	return arr;
}

type IntlLocalesArg = ConstructorParameters<typeof Intl.DateTimeFormat>[0];

interface GetWeekdayNamesOpts {
	weekStartsOn?: 'monday' | 1 | 'sunday' | 0,
	locales?: IntlLocalesArg
}
export const getWeekdayNamesShort = (
	opts: GetWeekdayNamesOpts = {
		weekStartsOn: 'monday'
	}
) => {
	let weekStartsOn: 1 | 0;
	if (typeof opts.weekStartsOn === 'number') {
		weekStartsOn = opts.weekStartsOn;
	} else {
		weekStartsOn = opts.weekStartsOn === 'monday' ? 1 : 0;
	}
	const now = new Date();
	const weekdays: string[] = [];

	const start = startOfWeek(now, { weekStartsOn });
	const end = endOfWeek(now, { weekStartsOn });
	const intl = new Intl.DateTimeFormat(opts.locales, { weekday: 'short' });

	eachDayOfInterval({ start, end }).forEach(day => {
		weekdays.push(intl.format(day));
	})
	return weekdays;
}
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