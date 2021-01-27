import { ONE, ZERO } from "../constants";
import { lineSizeToNumRequired } from "../utils";

export const threeInARowRegex = new RegExp(`${ZERO}{3}|${ONE}{3}`, 'g');

export function validateThreeInARow(lineStr) {
	return !(lineStr.match(threeInARowRegex));
}
export function validateMaxDigitsPerLine(lineStr, maxZero, maxOne) {
	if (maxZero == null || maxOne == null) {
		const numReq = lineSizeToNumRequired(lineStr.length);
		maxZero = numReq[ZERO];
		maxOne = numReq[ONE];
	}
	return lineStr.split(ZERO).length - 1 <= maxZero && lineStr.split(ONE).length - 1 <= maxOne;
}
export function validateLine(lineStr, maxZero, maxOne) {
	return validateThreeInARow(lineStr) && validateMaxDigitsPerLine(lineStr, maxZero, maxOne);
}