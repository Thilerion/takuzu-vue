export interface DataAnalysisCache<T extends number = number> {
	sortedArr?: T[],
	count?: number,
	sum?: number
}

export const min = (arr: number[]) => Math.min(...arr);
export const max = (arr: number[]) => Math.max(...arr);
export const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);

export const minMaxSum = (arr: number[]) => arr.reduce((acc, val) => {
	if (val < acc.min) acc.min = val;
	if (val > acc.max) acc.max = val;
	acc.sum += val;
	return acc;
}, { min: Infinity, max: -Infinity, sum: 0 });

export const getAverage = (arr: number[], data: DataAnalysisCache = {}): number => {
	const count = data.count ?? arr.length;
	const summed = data.sum ?? sum(arr);
	return summed / count;
}

const getSortedArr = (arr: number[], isSorted = false, data: DataAnalysisCache = {}): number[] => {
	if (isSorted) return arr;
	if (data.sortedArr) return data.sortedArr;
	return (data.sortedArr = [...arr].sort((a, z) => a - z));
}

export const getMedian = (arr: number[], { sorted = false } = {}, data: DataAnalysisCache = {}): number => {
	const count = data.count ?? arr.length;
	const sortedArr = getSortedArr(arr, sorted, data);
	const half = Math.floor(count / 2);
	if (count % 2 === 1) {
		return sortedArr[half];
	} else {
		return (sortedArr[half - 1] + sortedArr[half]) / 2;
	}
}

export const getVariance = (
	arr: number[],
	datasetOpts: DatasetOptions = { type: 'population' }
): number => {
	const avg = getAverage(arr, {});
	const n = arr.length;
	const summedDifferences = arr.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0);
	if (datasetOpts.type === 'population') {
		return summedDifferences / n;
	} else if (datasetOpts.type === 'sample') {
		return summedDifferences / (n - 1);
	} else {
		throw new Error(`Invalid dataset type: ${datasetOpts.type}`);
	}
}

export const getStdDev = (
	arr: number[],
	datasetOpts?: DatasetOptions
) => {
	const variance = getVariance(arr, datasetOpts);
	return Math.sqrt(variance);
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

export function asLogNormalDataset(dataset: number[]) {
	return dataset.map(val => Math.log(val));
}

export type DatasetOptions = {
	type: 'sample' | 'population'
}

export function getZScore(
	target: number,
	mean: number,
	stdDev: number
): number {
	return (target - mean) / stdDev;
}

export function isPotentialOutlier(
	target: number,
	mean: number,
	stdDev: number,
	threshold = 3
): { result: false } | { result: true, zScore: number } {
	const zScore = getZScore(target, mean, stdDev);
	const absZScore = Math.abs(zScore);
	if (absZScore > threshold) {
		return { result: true, zScore };
	} else {
		return { result: false };
	}
}

export function isPotentialOutlierFromDataset(
	target: number,
	dataset: number[],
	threshold?: number,
) {
	const mean = getAverage(dataset);
	const stdDev = getStdDev(dataset, { type: 'sample' });
	return isPotentialOutlier(target, mean, stdDev, threshold);
}