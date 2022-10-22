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

export function pickRandomly<T>(arr: ReadonlyArray<T>): T {
	const length = arr.length;
	if (length < 1) throw new Error('Cannot pick randomly from empty array.');
	else if (length === 1) return arr[0];
	const rnd = Math.floor(Math.random() * length);
	return arr[rnd];
}

export function dimensionsString(width: number, height: number) {
	return `${width}x${height}` as DimensionStr;
}

export function checkImprovementOverPreviousBest({
	time, best, previousBest
}: { time: number, best: number, previousBest: number }) {
	if (time !== best) {
		throw new Error('Not a time record. Check if this is a time record first.');
	}
	return previousBest - time;
}

export function checkIsTimeRecord({
	time, best, previousBest
}: { time: number, best: number, previousBest: number }) {
	return time === best && time < previousBest;
}