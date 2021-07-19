import { addDays, isSameDay } from 'date-fns';

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

export const getDateRange = (startDate, endDate = new Date()) => {
	const arr = [];
	for (let d = startDate; d <= endDate; d = getNextDay(d)) {
		arr.push(d);
	}
	return arr;
}

export const timeFormatter = (formatOptions) => {
	const {
		padMinutes = true,
		msPrecision = null,
	} = formatOptions;

	const padLeft = (num) => `0${num}`.slice(-2);

	return (timestampMS = 0) => {
		const fullSeconds = Math.floor(timestampMS / 1000);

		const seconds = padLeft(Math.floor(fullSeconds % 60));
		let minutes = Math.floor(fullSeconds / 60);
		if (padMinutes) minutes = padLeft(minutes);

		let str = `${minutes}:${seconds}`;

		if (msPrecision) {
			const precisionDivider = 1000 / msPrecision;
			let remainingMs = timestampMS - (fullSeconds * 1000);
			let msToPrecision = Math.floor(remainingMs / precisionDivider);
			str += `.${msToPrecision}`;
		}
		return str;
	}
}