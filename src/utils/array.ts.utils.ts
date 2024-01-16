export const chunk = <T>(arr: T[], size: number): T[][] => {
	if (size == null || size < 1) {
		throw new TypeError(`Invalid value for size of chunks (${size})`);
	}
	if (size >= arr.length) {
		return [[...arr]];
	}
	const chunked = [];
	for (let i = 0; i < arr.length; i += size) {
		const end = i + size;
		const values = arr.slice(i, end);
		chunked.push(values);
	}
	return chunked;
}
export const sortAsc = <T extends number>(arr: T[]) => [...arr].sort((a, z) => a - z);
export const sortDesc = <T extends number>(arr: T[]) => [...arr].sort((a, z) => z - a);


export const groupBy = <K extends PropertyKey, TItem extends Record<K, PropertyKey>>(
	items: TItem[],
	key: K
): Record<PropertyKey, TItem[]> => {
	return items.reduce((acc, item) => {
		const groupedKey = item[key];
		if (!acc[groupedKey]) {
			acc[groupedKey] = [];
		}
		acc[groupedKey].push(item);
		return acc;
	}, {} as Record<PropertyKey, TItem[]>);
}

function* cartesianGenerator<T>(...sets: T[][]): Generator<T[]> {
	const [head, ...tail] = sets;
	const remainder: Iterable<T[]> = tail.length ? cartesianGenerator(...tail) : [[]];

	for (const r of remainder) {
		for (const h of head) yield [h, ...r];
	}
}
const validateCartesianInput = <T>(sets: (T[] | T)[]): T[][] => {
	return sets.flatMap((set) =>
		Array.isArray(set)
			? set.length
				? [set] // use as normal
				: [] // empty array should be excluded
			: set == null
				? [] // null or undefined should be excluded
				: [[set]] // use normal values as arrays of length 1
	);
}
export const cartesian = <T>(sets: (T[] | T)[]): T[][] => {
	return [...cartesianGenerator(...validateCartesianInput(sets))];
}
export function* generateCartesian<T>(sets: T[][]): Generator<T[]> {
	yield* cartesianGenerator(...validateCartesianInput(sets));
}

export const getRandomItem = <T>(arr: ReadonlyArray<T>): T => {
	const rnd = Math.floor(Math.random() * arr.length);
	return arr[rnd];
}