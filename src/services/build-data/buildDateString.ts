import type { BuildDateString } from "./types";

export const createBuildDateString = (date = new Date()) => {
	const yy = `${date.getFullYear()}`.slice(-2);
	const mm = `${date.getMonth() + 1}`.padStart(2, '0');
	const dd = `${date.getDate()}`.padStart(2, '0');

	const hours = date.getHours();
	const minutes = date.getMinutes();
	// max minutes is 23 hours and 59 minutes = 1439 minutes
	// so this value is between 0 and (1439 / 2) = 720
	const minute2SinceMidnight = Math.round((hours * 60 + minutes) / 2);
	const min2String = `${minute2SinceMidnight}`.padStart(3, '0');

	return `${yy}${mm}${dd}${min2String}` as BuildDateString;
}

export const isBuildDateString = (str: string): str is BuildDateString => {
	return /^\d{9}$/.test(str);
}
function assertBuildDateString(str: string): asserts str is BuildDateString {
	if (!isBuildDateString(str)) {
		throw new Error(`Input is not a valid BuildDateString (value: "${str}")`);
	}
}
export const parseBuildDateString = (str: string): Date => {
	assertBuildDateString(str);
	const [,YY, MM, DD, mmmInterval2] = str.split(/^(\d{2})(\d{2})(\d{2})(\d{3})$/);
	const minutesSinceMidnight = Number.parseInt(mmmInterval2) * 2;
	const minutes = minutesSinceMidnight % 60;
	const hours = (minutesSinceMidnight - minutes) / 24;
	const day = Number(DD);
	const month = Number(MM);
	const year = Number(`20${YY}`);

	const date = new Date(year, month - 1, day, hours, minutes);
	return date;
}