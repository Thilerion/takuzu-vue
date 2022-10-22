import type { DimensionStr } from "@/lib/types";

export function getPercentageSlower(faster: number, slower: number) {
	const slowerSpeed = 1 / slower;
	const fasterSpeed = 1 / faster;
	return (fasterSpeed - slowerSpeed) / slowerSpeed;
}
export function getPercentageFaster(from: number, to: number) {
	return getPercentageSlower(to, from);
}

export function isMultipleOf(value = 0, multipleOf = 5) {
	return value > 0 && value % multipleOf === 0;
}
export function isOneOf(value = 0, arr: number[] = []) {
	return arr.includes(value);
}
export function oneOfOrMultipleOf(value: number, {
	oneOf = [],
	multipleOf = 5
}: { oneOf?: number[], multipleOf?: number }) {
	if (isOneOf(value, oneOf)) return true;
	const min = Math.max(...oneOf);
	if (value <= min) return false;
	return isMultipleOf(value, multipleOf);
}

export function pickRandomly<T>(arr: ReadonlyArray<T>): T | null {
	const length = arr.length;
	if (length < 1) return null;
	else if (length === 1) return arr[0];
	const rnd = Math.floor(Math.random() * length);
	return arr[rnd];
}

export function dimensionsString(width: number, height: number) {
	return `${width}x${height}` as DimensionStr;
}

export function checkImprovementOverPreviousBest({
	time, best, previousBest
}: { time: number, best: number, previousBest: number | null }) {
	if (time !== best) {
		throw new Error('Not a time record. Check if this is a time record first.');
	} else if (previousBest == null) {
		throw new Error('Not an improvement, as there is no previousBest time.');
	}
	return previousBest - time;
}

export function checkIsTimeRecord({
	time, best, previousBest
}: { time: number, best: number, previousBest: number | null }) {
	return time === best && previousBest != null && time < previousBest;
}