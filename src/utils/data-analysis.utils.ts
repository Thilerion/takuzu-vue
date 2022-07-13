export interface DataAnalysisCache<T extends number = number> {
	sortedArr?: T[],
	count?: number,
	sum?: number
}
export type Extent = [min: number, max: number];

export const min = (arr: number[]) => Math.min(...arr);
export const max = (arr: number[]) => Math.max(...arr);
export const extent = (arr: number[]) => [min(arr), max(arr)];
export const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);

export const minMaxSum = (arr: number[]) => arr.reduce((acc, val) => {
	if (val < acc.min) acc.min = val;
	if (val > acc.max) acc.max = val;
	acc.sum += val;
	return acc;
}, { min: Infinity, max: -Infinity, sum: 0 });

export const average = (arr: number[], data: DataAnalysisCache): number => {
	const count = data.count ?? arr.length;
	const summed = data.sum ?? sum(arr);
	return summed / count;
}

const getSortedArr = (arr: number[], isSorted = false, data: DataAnalysisCache): number[] => {
	if (isSorted) return arr;
	if (data.sortedArr) return data.sortedArr;
	return (data.sortedArr = [...arr].sort((a, z) => a - z));
}

export const median = (arr: number[], { sorted = false } = {}, data: DataAnalysisCache): number => {
	const count = data.count ?? arr.length;
	const sortedArr = getSortedArr(arr, sorted, data);
	const half = Math.floor(count / 2);
	if (count % 2 === 1) {
		return sortedArr[half];
	} else {
		return (sortedArr[half - 1] + sortedArr[half]) / 2;
	}
}