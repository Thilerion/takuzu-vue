import { addMinutes } from "date-fns";
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
	const year = parseInt(str.slice(0, 2)) + 2000;
	const month = parseInt(str.slice(2, 4));
	const day = parseInt(str.slice(4, 6));
	const mmmInterval2 = str.slice(6, 9);
	const minutesSinceMidnight = Number.parseInt(mmmInterval2) * 2;

	return addMinutes(
		new Date(year, month - 1, day),
		minutesSinceMidnight
	);
}