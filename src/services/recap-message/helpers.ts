import type { DimensionStr } from "@/lib/types.js";

export function getPercentageSlower(faster: number, slower: number): number {
	const slowerSpeed = 1 / slower;
	const fasterSpeed = 1 / faster;
	return (fasterSpeed - slowerSpeed) / slowerSpeed;
}
export function getPercentageFaster(from: number, to: number): number {
	return getPercentageSlower(to, from);
}

export function isMultipleOf(value = 0, multipleOf = 5): boolean {
	return value > 0 && value % multipleOf === 0;
}
export function isOneOf(value = 0, arr: number[] = []): boolean {
	return arr.includes(value);
}
export function oneOfOrMultipleOf(value: number, {
	oneOf = [],
	multipleOf = 5
}: { oneOf?: number[], multipleOf?: number }): boolean {
	if (isOneOf(value, oneOf)) return true;
	const min = Math.max(...oneOf);
	if (value <= min) return false;
	return isMultipleOf(value, multipleOf);
}

export function falseResult() {
	return { result: false as const };
}
export function trueResult(context: Record<string, unknown> = {}) {
	return { result: true as const, context };
}
export function createResult(result: true, context: Record<string, unknown>): { result: true, context: Record<string, unknown> };
export function createResult(result: false): { result: false };
export function createResult(result: boolean, context?: Record<string, unknown>): { result: boolean, context?: Record<string, unknown> };
export function createResult(result: boolean, context?: Record<string, unknown>) {
	if (result) return trueResult(context);
	return falseResult();
}

export function pickRandomly<T>(arr: T[]): T | { result: false } {
	const length = arr.length;
	if (length === 0) return falseResult();
	if (length === 1) return arr[0];
	const rnd = Math.floor(Math.random() * length);
	return arr[rnd];
}

export function dimensionsString(width: number, height: number): DimensionStr {
	return `${width}x${height}`;
}

type TimeBestPrevBestParams = {
	time: number;
	best: number;
	previousBest: number;
};
export function checkImprovementOverPreviousBest({
	time, best, previousBest
}: TimeBestPrevBestParams): number {
	if (time !== best) {
		throw new Error('Not a time record. Check if this is a time record first.');
	}
	return previousBest - time;
}

export function checkIsTimeRecord({
	time, best, previousBest
}: TimeBestPrevBestParams): boolean {
	return time === best && time < previousBest;
}