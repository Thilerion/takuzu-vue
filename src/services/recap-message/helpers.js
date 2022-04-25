export function relativeGrowth(from, to) {
	return (to - from) / Math.abs(from);
}

export function isMultipleOf(value = 0, multipleOf = 5) {
	return value > 0 && value % multipleOf === 0;
}
export function isOneOf(value = 0, arr = []) {
	return arr.includes(value);
}
export function oneOfOrMultipleOf(value, {
	oneOf = [],
	multipleOf = 5
}) {
	if (isOneOf(value, oneOf)) return true;
	const min = Math.max(...oneOf);
	if (value <= min) return false;
	return isMultipleOf(value, multipleOf);
}

export function falseResult() {
	return { result: false };
}
export function trueResult(context = {}) {
	return { result: true, context };
}
export function createResult(result, context) {
	if (result) return trueResult(context);
	return falseResult();
}

export function pickRandomly(arr) {
	const length = arr.length;
	if (length === 0) return falseResult();
	if (length === 1) return arr[0];
	const rnd = Math.floor(Math.random() * length);
	return arr[rnd];
}

export function dimensionsString(width, height) {
	return `${width}x${height}`;
}

export function checkImprovementOverPreviousBest({
	time, best, previousBest
}) {
	if (time !== best) {
		throw new Error('Not a time record. Check if this is a time record first.');
	}
	return previousBest - time;
}

export function checkIsTimeRecord({
	time, best, previousBest
}) {
	return time === best && time < previousBest;
}