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

export const randomIndex = (arr: ReadonlyArray<unknown>): number => Math.floor(Math.random() * arr.length);
export const pickRandom = <T>(arr: ReadonlyArray<T>): T => arr[randomIndex(arr)];