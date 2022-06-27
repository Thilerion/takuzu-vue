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


// GroupBy source: https://johns.codes/blog/type-safe-groupby-in-typescript
type MapValuesToKeysIfAllowed<T> = {
	[K in keyof T]: T[K] extends PropertyKey ? K : never;
  };
type ValuesOf<A> = A extends infer O ? A[keyof A] : never;
type Filter<T> = ValuesOf<MapValuesToKeysIfAllowed<T>>;
  
export function groupBy<T extends Record<PropertyKey, any>, Key extends Filter<T>>(
	arr: T[],
	key: Key
  ): Record<T[Key], T[]> {
	return arr.reduce((accumulator, val) => {
	  const groupedKey = val[key];
	  if (!accumulator[groupedKey]) {
		accumulator[groupedKey] = [];
	  }
	  accumulator[groupedKey].push(val);
	  return accumulator;
	}, {} as Record<T[Key], T[]>);
};