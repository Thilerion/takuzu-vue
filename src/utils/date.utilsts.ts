import { addDays, eachDayOfInterval, endOfWeek, isSameDay, startOfWeek, subDays } from 'date-fns/esm';
export { isSameDay } from 'date-fns/esm';

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

export const getMonthNameShort = (
	date: Date | Timestamp,
	locales?: IntlLocalesArg
) => {
	const intl = new Intl.DateTimeFormat(locales, { month: 'short' });
	return intl.format(date).replace('.', '');
}

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