import { ONE, ZERO } from "../constants";
import { lineSizeToNumRequired } from "../utils/puzzle-line.utils";

export const threeInARowRegex = new RegExp(`${ZERO}{3,}|${ONE}{3,}`, 'g');

export function validateThreeInARow(lineStr: string) {
	return !(lineStr.match(threeInARowRegex));
}
export function validateMaxDigitsPerLine(lineStr: string, maxZero?: number, maxOne?: number) {
	if (maxZero == null || maxOne == null) {
		const numReq = lineSizeToNumRequired(lineStr.length);
		maxZero = numReq[ZERO];
		maxOne = numReq[ONE];
	}
	return lineStr.split(ZERO).length - 1 <= maxZero && lineStr.split(ONE).length - 1 <= maxOne;
}
export function validateLine(lineStr: string, maxZero?: number, maxOne?: number) {
	return validateThreeInARow(lineStr) && validateMaxDigitsPerLine(lineStr, maxZero, maxOne);
}