/** Basic compare function type */
export type CompareFunction<T> = (a: T, b: T) => number;
/** Getter function type */
export type OrderByGetter<T, K> = (item: T) => K;
/** Sort order type */
export type SortOrder = 'asc' | 'desc';

export type GetKeyWithDesc<T extends string> = T extends `-${infer K}` ? K : T;
/** Type for default comparison by key, allowing for descending order with '-' prefix */
export type CompareDefaultByKey<T> = T extends Record<string, any> ? (keyof T & string) | `-${keyof T & string}` : never;
/** Union type for compare items, either a CompareFunction or a key to compare by */
export type CompareItem<T> = CompareFunction<T> | CompareDefaultByKey<T>;

/** Creates a comparison function for numeric values */
export function compareNumeric<T>(getter: OrderByGetter<T, number | null | undefined>, order: SortOrder = 'asc'): CompareFunction<T> {
	return (a: T, b: T) => {
		const aVal = getter(a);
		const bVal = getter(b);
		if (aVal === bVal) return 0;
		if (aVal == null || bVal == null) {
			return handleNullishLast(aVal, bVal, order);
		}
		return order === 'asc' ? aVal - bVal : bVal - aVal;
	}
}

/** Creates a comparison function for string values using localeCompare */
export function compareString<T>(getter: OrderByGetter<T, string | null | undefined>, localeOpts?: Intl.CollatorOptions, order: SortOrder = 'asc'): CompareFunction<T> {
	return (a: T, b: T) => {
		const aVal = getter(a);
		const bVal = getter(b);
		if (aVal === bVal) return 0;
		if (aVal == null || bVal == null) {
			return handleNullishLast(aVal, bVal, order);
		}
		return order === 'asc' ? aVal.localeCompare(bVal, 'en', localeOpts) : bVal.localeCompare(aVal, 'en', localeOpts);
	}
}

/** Creates a comparison function for values in an array, using a specific order */
export function compareByOrder<T, K>(getter: OrderByGetter<T, K>, specificOrder: K[], order: SortOrder = 'asc'): CompareFunction<T> {
	return (a: T, b: T) => {
		const valueA = getter(a);
		const valueB = getter(b);
		const indexA = specificOrder.indexOf(valueA);
		const indexB = specificOrder.indexOf(valueB);
		if (indexA === indexB) return 0;
		if (indexA === -1) return order === 'asc' ? 1 : -1;
		if (indexB === -1) return order === 'asc' ? -1 : 1;
		return order === 'asc' ? indexA - indexB : indexB - indexA;
	}
}

/** Default comparison function that handles both numeric and string values */
function defaultCompare<T, K>(getter: OrderByGetter<T, K | null | undefined>, order: SortOrder = 'asc'): CompareFunction<T> {
	return (a: T, b: T) => {
		const valueA = getter(a);
		const valueB = getter(b);

		if (valueA == null || valueB == null) {
			return handleNullishLast(valueA, valueB, order);
		}

		if (typeof valueA === 'number' && typeof valueB === 'number') {
			return order === 'asc' ? valueA - valueB : valueB - valueA;
		}

		return order === 'asc' 
			? String(valueA).localeCompare(String(valueB)) 
			: String(valueB).localeCompare(String(valueA));
	};
}

/** Compare function that compares by a specific key, with a default compare function for the key. */
export function defaultCompareByKey<K extends string>(k: K): CompareFunction<Record<GetKeyWithDesc<K>, unknown>> {
	let key: GetKeyWithDesc<K>;
	let order: SortOrder = 'asc';
	if (k.startsWith('-')) {
		key = k.slice(1) as GetKeyWithDesc<K>;
		order = 'desc';
	} else {
		key = k as GetKeyWithDesc<K>;
	}
	return defaultCompare((item) => item[key], order);
}

// Null handling
function handleNullishLast(a: unknown | null | undefined, b: unknown | null | undefined, order: SortOrder) {
	if (a == null && b == null) return 0;
	else if (a == null) return order === 'asc' ? 1 : -1;
	else if (b == null) return order === 'asc' ? -1 : 1;
	return 0;
}


/**
 * Creates a composite comparison function from an array of comparison items
 * @param compares Array of comparison items (functions or property keys)
 * @returns A composite comparison function
 */
export function combineCompares<ArrayItem>(compares: CompareItem<ArrayItem>[]): CompareFunction<ArrayItem> {
	const compareFns: CompareFunction<ArrayItem>[] = compares.map(c => {
		if (typeof c === 'string') {
			return defaultCompareByKey(c) as CompareFunction<ArrayItem>;
		}
		return c;
	})
	return (a: ArrayItem, b: ArrayItem) => {
		for (const compare of compareFns) {
			const res = compare(a, b);
			if (res !== 0) return res;
		}
		return 0;
	}
}

export function createOrderBy<Item>(compareFn: CompareFunction<Item>) {
	const compareFns: CompareFunction<Item>[] = [compareFn];
	const result = {
		sort: (arr: ReadonlyArray<Item>) => arr.toSorted(combineCompares(compareFns)),
		thenBy: (compareFn: CompareFunction<Item>) => {
			compareFns.push(compareFn);
			return result;
		},
	}
	return result;
}