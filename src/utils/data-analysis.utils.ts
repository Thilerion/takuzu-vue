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

/**
 * Calculate the exponential moving average (EMA) of a series of values.
 */
export function calculateEma(values: number[], span: number): number {
	const alpha = 2 / (span + 1);

	if (span < 1) {
		throw new Error("Span must be greater than or equal to 1");
	}
	
	if (values.length < span) {
		span = values.length;
	}

	const emaSeries: number[] = [values[0]];
	for (let i = 1; i < values.length; i++) {
		const next = (alpha * values[i]) + ((1 - alpha) * emaSeries[i - 1]);
		emaSeries.push(next);
	}
	return emaSeries.at(-1)!;
}

/**
 * Calculate the weighted moving average (WMA) of a series of values.
 */
export function calculateWeightedMovingAverage(values: number[], weights: number[]): number {
	if (values.length !== weights.length) {
		throw new Error("Values and weights must have the same length");
	}
	const sum = values.reduce((acc, val, i) => acc + val * weights[i], 0);
	const weightSum = weights.reduce((acc, val) => acc + val, 0);
	return sum / weightSum;
}

export type WMADynamicWeightFn = (distanceFromEnd: number, index: number, values: number[]) => number;
export function calculateDynamicWeightedMovingAverage(values: number[], getWeight: WMADynamicWeightFn): number {
	const length = values.length;
	const weights = new Array(length).fill(0).map((_, i) => {
		return getWeight(length - i - 1, i, values);
	})
	return calculateWeightedMovingAverage(values, weights);
}
