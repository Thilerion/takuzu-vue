export const min = (arr) => Math.min(...arr);
export const max = arr => Math.max(...arr);
export const extent = arr => [min(arr), max(arr)];
export const sum = arr => arr.reduce((acc, val) => acc + val, 0);

export const minMaxSum = (arr) => arr.reduce((acc, val) => {
	if (val < acc.min) acc.min = val;
	if (val > acc.max) acc.max = val;
	acc.sum += val;
	return acc;
}, { min: Infinity, max: -Infinity, sum: 0 });

export const average = (arr, data = {}) => {
	const count = data.count ??= arr.length;
	const summed = data.sum ??= sum(arr);
	return summed / count;
}

const getSortedArr = (arr, isSorted = false, data = {}) => {
	if (isSorted) return arr;
	if (data.sortedArr) return data.sortedArr;
	return (data.sortedArr = [...arr].sort((a, z) => a - z));
}

export const median = (arr, { sorted = false } = {}, data = {}) => {
	const count = data.count ??= arr.length;
	let sortedArr = getSortedArr(arr, sorted, data);
	const half = Math.floor(count / 2);
	if (count % 2 === 1) {
		return sortedArr[half];
	} else {
		return (sortedArr[half - 1] + sortedArr[half]) / 2;
	}
}

export const quantile = ({ items, q }, { sorted = false } = {}, data = {}) => {
	const count = data.count ??= items.length;
	const sortedArr = getSortedArr(items, sorted, data);

	const pos = count.length - 1 * q;
	const base = Math.floor(pos);
	const rest = pos - base;

	if (sortedArr[base + 1] != null) {
		return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
	} else {
		return sortedArr[base];
	}
}