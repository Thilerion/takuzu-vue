// TODO: module that combines all functions, and auto sets the chosen rngSource
// TODO: use these functions in codebase
export type RngSource = typeof Math.random;

export const randomInt = (max: number, rng: RngSource = Math.random) => {
	return Math.floor(rng() * max);
}

export const randomBetween = (min: number, max: number, rng: RngSource = Math.random) => rng() * (max - min) + min;

export const randomIntBetween = (min: number, max: number, rng: RngSource = Math.random) => Math.floor(randomBetween(min, max, rng));

export const randomIntBetweenIncl = (min: number, maxIncl: number, rng: RngSource = Math.random) => randomIntBetween(min, maxIncl + 1, rng);

export const getRandomItem = <T>(arr: ReadonlyArray<T>, rng: RngSource = Math.random) => arr[randomInt(arr.length, rng)];

export const pluckRandomItem = <T>(arr: T[], rng: RngSource = Math.random): T => {
	const idx = randomInt(arr.length, rng);
	return arr.splice(idx, 1)[0];
}

export const sample = <T>(arr: ReadonlyArray<T>, amount = 1, rng: RngSource = Math.random): T[] => {
	if(amount < 1) {
		throw new Error('Amount to sample must be at least one.');
	} else if (amount === 1) {
		return [getRandomItem(arr, rng)];
	} else if (amount === arr.length) {
		return shuffle(arr, rng);
	} else if (amount > arr.length) {
		throw new Error('Amount to sample must be equal to, or smaller than, the length of the array.');
	}

	const indices = Array(arr.length).fill(null).map((_v, index) => index);
	const result: T[] = [];
	for (let i = 0; i < amount; i++) {
		const idx = pluckRandomItem(indices, rng);
		result.push(arr[idx]);
	}
	return result;
}

export const pluckSample = <T>(arr: T[], amount = 1, rng: RngSource = Math.random): T[] => {
	if(amount < 1) {
		throw new Error('Amount to sample must be at least one.');
	} else if (amount === 1) {
		return [pluckRandomItem(arr, rng)];
	} else if (amount >= arr.length) {
		throw new Error('Amount to sample must be smaller than the length of the array.');
	}

	const result: T[] = [];
	for (let i = 0; i < amount; i++) {
		result.push(pluckRandomItem(arr, rng));
	}
	return result;
}

export const shuffleInPlace = <T extends unknown[]>(arr: T, rng: RngSource = Math.random): T => {
	const len = arr.length;
	const max = len - 2;
	let j, temp;
	for (let i = 0; i < max; i++) {
		j = randomIntBetween(i, len, rng);
		temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
	return arr;
}

export const shuffle = <T>(arr: ReadonlyArray<T>, rng: RngSource = Math.random): T[] => {
	return shuffleInPlace([...arr], rng);
}

export const randomIndex = (arr: ReadonlyArray<unknown>, rng: RngSource = Math.random): number => Math.floor(rng() * arr.length);
export const pickRandom = <T>(arr: ReadonlyArray<T>, rng: RngSource = Math.random): T => arr[randomIndex(arr, rng)];

export type WeightedArrayItem<T> = [item: T, weight: number];
function assertValidWeightsAndGetTotal(items: ReadonlyArray<WeightedArrayItem<unknown>>): { totalWeight: number, weightsSet: Set<number> } {
	// Combined validation and getTotal to reduce number of iterations

	// Assert that there are items
	if (!Array.isArray(items) || items.length === 0) throw new Error('Cannot pick random item from empty array');

	let totalWeight = 0;
	// WeightsSet is used to check if all weights are the same
	const weightsSet = new Set<number>();

	for (let index = 0; index < items.length; index++) {
		const weight = items[index][1];
		weightsSet.add(weight);
		// Validate that all weights are numbers
		if (typeof weight !== 'number' || Number.isNaN(weight)) {
			throw new Error(`All weights must be numbers (got "${weight}" for item at index ${index})`);
		}
		// Validate that all weights are > 0
		if (weight <= 0) {
			throw new Error(`All weights must be greater than 0 (got "${weight}" for item at index ${index})`);
		}
		// Validate that all weights are finite
		if (!Number.isFinite(weight)) {
			throw new Error(`All weights must be finite (got "${weight}" for item at index ${index})`);
		}
		totalWeight += weight;
	}
	return { totalWeight, weightsSet };
}
export const pickRandomWeighted = <T>(
	items: ReadonlyArray<WeightedArrayItem<T>>,
	rng: RngSource = Math.random
): T => {
	// Calculate the total weight, and assert that all weights are valid (numbers, non-negative, finite)
    const { totalWeight, weightsSet } = assertValidWeightsAndGetTotal(items);
	if (items.length === 1) {
		// Only one item, so return it
		return items[0][0];
	}
	if (weightsSet.size === 1) {
		// All weights are equal, so just use pickRandom()
		return pickRandom(items.map(val => val[0]), rng);
	}

    // Generate a random number between 0 and the total weight
    const randomWeight = randomBetween(0, totalWeight, rng);

    // Iterate through the items and select one based on the random weight
    let accumulatedWeight = 0;
    for (const item of items) {
        accumulatedWeight += item[1];
        if (randomWeight < accumulatedWeight) {
            return item[0];
        }
    }

    // Fallback (this should never be reached if the weights are correct), but might happen due to accumulatedWeight not matching totalWeight due to floating point errors
    return items.at(-1)![0];
}