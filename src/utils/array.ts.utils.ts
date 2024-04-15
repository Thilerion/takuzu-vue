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

export const range = (n: number) => Array(n).fill(null).map((_, idx) => idx);

export const arrayCountValues = <T, K extends T>(arr: T[], targetValue: K) => {
	return arr.reduce((acc, val) => {
		if (val === targetValue) acc += 1;
		return acc;
	}, 0);
}
export const arrayCountValuesAsMap = <T>(arr: T[]) => {
	return arr.reduce((acc, val) => {
		const num = (acc.get(val) || 0) + 1;
		acc.set(val, num);
		return acc;
	}, new Map() as Map<T, number>);
}

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