import type { BuildDateString } from "./types";

// The function that creates the BuildDateString, "createBuildDateString", is located within
// the scripts/build-metadata.ts file, as it is only used within the build process.
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
	const [,YY, MM, DD, mmmInterval2] = str.split(/^(\d{2})(\d{2})(\d{2})\+(\d{3})$/);
	const minutesSinceMidnight = Number.parseInt(mmmInterval2) * 2;
	const minutes = minutesSinceMidnight % 60;
	const hours = (minutesSinceMidnight - minutes) / 24;
	const day = Number(DD);
	const month = Number(MM);
	const year = Number(`20${YY}`);

	const date = new Date(year, month - 1, day, hours, minutes);
	return date;
}