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


export const groupBy = <K extends PropertyKey, TItem extends Record<K, PropertyKey >> (
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