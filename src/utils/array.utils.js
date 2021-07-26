export function groupBy(arr, key, initialMap = {}) {
	return arr.reduce((acc, val) => {
		const keyVal = val[key];
		if (acc[keyVal] == null) acc[keyVal] = [];
		acc[keyVal].push(val);
		return acc;
	}, initialMap);
}

export function sortAsc(arr) {
	return [...arr].sort((a, b) => a - b);
}

export const sum = arr => arr.reduce((acc, val) => acc + val, 0);
export const mean = arr => arr.length ? sum(arr) / (arr.length) : undefined;
export const percentile = (arr, p) => {
	const sorted = sortAsc(arr);
	const pos = (sorted.length - 1) * p;
	const base = Math.floor(pos);
	const rest = pos - base;

	if (sorted[base + 1] != null) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	} else {
		return sorted[base];
	}
}
export const median = arr => percentile(arr, .5);
export const iqr = arr => {
	const q25 = Math.floor(percentile(arr, .25));
	const q75 = Math.floor(percentile(arr, .75));
	return q75 - q25;
}
export const min = arr => Math.min(...arr);
export const max = arr => Math.max(...arr);
export const minMax = arr => {
	return [min(arr), max(arr)];
}
export const stdDev = arr => {
	const mu = mean(arr);
	const diffArr = arr.map(a => (a - mu) ** 2);
	return Math.sqrt(sum(diffArr) / (arr.length - 1));
}
export const zScores = (arr, m = mean(arr), stddev = stdDev(arr)) => {
	return arr.map(val => {
		return (val - m) / stddev;
	})
}