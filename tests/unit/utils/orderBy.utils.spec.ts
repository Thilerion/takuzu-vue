import { compareByOrder, compareNumeric, compareString, combineCompares, defaultCompareByKey, ArrayComparator } from "@/utils/orderBy.utils.js";

describe('orderBy utils', () => {
	describe('compareNumeric', () => {
		it('should compare numbers', () => {
			const compare = compareNumeric((val: Record<'a', number>) => val.a);
			expect(compare({ a: 1 }, { a: 2 })).toBeLessThan(0);
			expect(compare({ a: 2 }, { a: 1 })).toBeGreaterThan(0);
			expect(compare({ a: 1 }, { a: 1 })).toBe(0);
		})

		it('should compare numbers with descending order', () => {
			const compare = compareNumeric((val: Record<'a', number>) => val.a, 'desc');
			expect(compare({ a: 1 }, { a: 2 })).toBeGreaterThan(0);
			expect(compare({ a: 2 }, { a: 1 })).toBeLessThan(0);
			expect(compare({ a: 1 }, { a: 1 })).toBe(0);
		})

		it('handles nullish values by putting them at the end', () => {
			const compare = compareNumeric((val: Record<'a', number | null | undefined>) => val.a);
			expect(compare({ a: null }, { a: 2 })).toBeGreaterThan(0);
			expect(compare({ a: 2 }, { a: null })).toBeLessThan(0);
			expect(compare({ a: null }, { a: undefined })).toBe(0);

			const compareDesc = compareNumeric((val: Record<'a', number | null | undefined>) => val.a, 'desc');
			expect(compareDesc({ a: null }, { a: 2 })).toBeLessThan(0);
			expect(compareDesc({ a: 2 }, { a: null })).toBeGreaterThan(0);
			expect(compareDesc({ a: null }, { a: undefined })).toBe(0);
		})
	})

	describe('compareString', () => {
		it('should compare strings using localeCompare', () => {
			const compare = compareString((val: Record<'a', string>) => val.a);
			expect(compare({ a: 'a' }, { a: 'b' })).toBeLessThan(0);
			expect(compare({ a: 'b' }, { a: 'a' })).toBeGreaterThan(0);
			expect(compare({ a: 'a' }, { a: 'a' })).toBe(0);			
		})
		
		it('should respect locale options (numeric: true)', () => {
			const compareA = compareString((val: Record<'a', string>) => val.a);
			expect(compareA({ a: '2' }, { a: '10' })).toBeGreaterThan(0); // default: "2" > "10"

			const compareB = compareString((val: Record<'a', string>) => val.a, { numeric: true });
			expect(compareB({ a: '2' }, { a: '10' })).toBeLessThan(0); // using numeric option: "2" < "10"
		})

		it('should respect locale options (locale: en vs sv)', () => {
			const compareEn = compareString((val: { char: string }) => val.char, { locale: 'en' });
			const compareSv = compareString((val: { char: string }) => val.char, { locale: 'sv' });

			expect(compareEn({ char: 'z' }, { char: 'ä' })).toBeGreaterThan(0);
			expect(compareSv({ char: 'z' }, { char: 'ä' })).toBeLessThan(0);
		})

		it('handles nullish values by putting them at the end', () => {
			type Item = {
				a?: string | null
			}
			const compareAsc = compareString((val: Item) => val.a, undefined, 'asc');
			expect(compareAsc({ a: null }, { a: 'a' })).toBeGreaterThan(0);
			expect(compareAsc({ a: 'a' }, { a: null })).toBeLessThan(0);
			expect(compareAsc({ a: null }, { a: undefined })).toBe(0);

			const compareDesc = compareString((val: Item) => val.a, undefined, 'desc');
			expect(compareDesc({ a: null }, { a: 'a' })).toBeLessThan(0);
			expect(compareDesc({ a: 'a' }, { a: null })).toBeGreaterThan(0);
			expect(compareDesc({ a: null }, { a: undefined })).toBe(0);
		})
	})

	describe('compareByOrder', () => {
		it('should compare by a specific order', () => {
			const order = [1, 3, 2];
			const compare = compareByOrder((val: Record<'a', number>) => val.a, order);
			expect(compare({ a: 1 }, { a: 2 })).toBeLessThan(0);
			expect(compare({ a: 2 }, { a: 1 })).toBeGreaterThan(0);
			expect(compare({ a: 2 }, { a: 3 })).toBeGreaterThan(0);
		})

		it('should handle nullish values in the order', () => {
			const order = [undefined, 1, 2, null, 3, 4] as (number | undefined | null)[];
			type Item = { prop?: number | null };
			const compare = compareByOrder((val: Item) => val.prop, order);
			// 1 after undefined
			expect(compare({ prop: undefined }, { prop: 1 })).toBeLessThan(0);
			// null after undefined, null after 2
			expect(compare({ prop: undefined }, { prop: null })).toBeLessThan(0);
			expect(compare({ prop: 2 }, { prop: null })).toBeLessThan(0);
			expect(compare({ prop: null }, { prop: 2 })).toBeGreaterThan(0);

			// null before 4
			expect(compare({ prop: 4 }, { prop: null })).toBeGreaterThan(0);

			const arr: Item[] = [
				{ prop: undefined },
				{ prop: 1 },
				{ prop: null },
				{},
				{ prop: 4 },
				{ prop: 2 },
				{ prop: 3 },
				{ prop: null },
				{}
			];
			const sorted = [...arr].sort(compare);
			expect(sorted).toEqual([
				{ prop: undefined },
				{},
				{},
				{ prop: 1 },
				{ prop: 2 },
				{ prop: null },
				{ prop: null },
				{ prop: 3 },
				{ prop: 4 },
			])
		})
	})

	describe('defaultCompareByKey', () => {
		it('should compare by a specific key using a default compare function (with number)', () => {
			const compareAsc = defaultCompareByKey('difficulty');
			expect(compareAsc({ difficulty: 1 }, { difficulty: 2 })).toBeLessThan(0);
			expect(compareAsc({ difficulty: 2 }, { difficulty: 1 })).toBeGreaterThan(0);
			expect(compareAsc({ difficulty: 1 }, { difficulty: 1 })).toBe(0);

			const compareDesc = defaultCompareByKey('-difficulty');
			expect(compareDesc({ difficulty: 1 }, { difficulty: 2 })).toBeGreaterThan(0);
			expect(compareDesc({ difficulty: 2 }, { difficulty: 1 })).toBeLessThan(0);
			expect(compareDesc({ difficulty: 1 }, { difficulty: 1 })).toBe(0);
		})

		it('should compare by a specific key using a default compare function (with string)', () => {
			const compareAsc = defaultCompareByKey('name');
			expect(compareAsc({ name: 'aaa' }, { name: 'abc' })).toBeLessThan(0);
			expect(compareAsc({ name: 'abc' }, { name: 'aaa' })).toBeGreaterThan(0);
			expect(compareAsc({ name: 'aaa' }, { name: 'aaa' })).toBe(0);

			const compareDesc = defaultCompareByKey('-name');
			expect(compareDesc({ name: 'aaa' }, { name: 'abc' })).toBeGreaterThan(0);
			expect(compareDesc({ name: 'abc' }, { name: 'aaa' })).toBeLessThan(0);
			expect(compareDesc({ name: 'aaa' }, { name: 'aaa' })).toBe(0);
		})
	})

	describe('combineCompares', () => {
		it('should combine multiple comparison functions', () => {
			type ItemType = 'Normal' | 'Odd' | 'Rect';
			const itemTypeOrder = ['Normal', 'Odd', 'Rect'];
			type Item = { difficulty: number, size: number, type: ItemType };
			
			const compareA = compareNumeric((val: Item) => val.difficulty);
			const compareB = "size";
			const compareC = compareByOrder((val: Item) => val.type, itemTypeOrder);
			const orderByFn = combineCompares([compareA, compareB, compareC]);

			const arr: Item[] = [
				{ difficulty: 1, size: 10, type: 'Normal' },
				{ difficulty: 2, size: 10, type: 'Normal' },
				{ difficulty: 3, size: 10, type: 'Normal' },
				{ difficulty: 1, size: 10, type: 'Odd' },
				{ difficulty: 2, size: 10, type: 'Odd' },
				{ difficulty: 3, size: 10, type: 'Odd' },
				{ difficulty: 1, size: 4, type: 'Rect' },
				{ difficulty: 1, size: 6, type: 'Rect' },
				{ difficulty: 1, size: 8, type: 'Rect' },
				{ difficulty: 1, size: 4, type: 'Normal' },
				{ difficulty: 1, size: 4, type: 'Odd' },
			];
			const result = [...arr].sort(orderByFn);
			const expectedArr: Item[] = [
				// Difficulty 1=>2=>3, Size 4=>10, Normal=>Odd=>Rect
				{ difficulty: 1, size: 4, type: 'Normal' },
				{ difficulty: 1, size: 4, type: 'Odd' },
				{ difficulty: 1, size: 4, type: 'Rect' },
				{ difficulty: 1, size: 6, type: 'Rect' },
				{ difficulty: 1, size: 8, type: 'Rect' },
				{ difficulty: 1, size: 10, type: 'Normal' },
				{ difficulty: 1, size: 10, type: 'Odd' },
				{ difficulty: 2, size: 10, type: 'Normal' },
				{ difficulty: 2, size: 10, type: 'Odd' },
				{ difficulty: 3, size: 10, type: 'Normal' },
				{ difficulty: 3, size: 10, type: 'Odd' },				
			]
			expect(result).toEqual(expectedArr);
		})
	})

	describe('ArrayComparator', () => {
		type User = {
			id: number,
			name: string,
			age: number,
			registeredAt: Date,
			misc: {
				isActive: boolean,
			},
			score: number | null,
		}
		let arr: ReadonlyArray<Readonly<User>>;
		beforeEach(() => {
			arr = [
				{ id: 1, name: 'John', age: 30, registeredAt: new Date(2024, 1, 1), misc: { isActive: true }, score: 100 },
				{ id: 2, name: 'Jane', age: 25, registeredAt: new Date(2023, 1, 1), misc: { isActive: true }, score: null },
				{ id: 3, name: 'Bob', age: 35, registeredAt: new Date(2022, 1, 1), misc: { isActive: false }, score: 50 },
				{ id: 4, name: 'Alice', age: 40, registeredAt: new Date(2021, 1, 1), misc: { isActive: false }, score: null },
				{ id: 5, name: 'Dave', age: 45, registeredAt: new Date(2020, 1, 1), misc: { isActive: true }, score: null },
				{ id: 6, name: 'Eve', age: 30, registeredAt: new Date(2024, 1, 1), misc: { isActive: true }, score: null },
				{ id: 7, name: 'Frank', age: 55, registeredAt: new Date(2024, 1, 1), misc: { isActive: false }, score: null },
				{ id: 8, name: 'John', age: 30, registeredAt: new Date(2021, 1, 1), misc: { isActive: false }, score: 50 },
			];
		})

		it('should sort by a single numeric property', () => {
			const sorted = ArrayComparator.orderBy<User>(compareNumeric(u => u.age)).sort(arr);
			expect(sorted.map(u => u.age)).toEqual([25, 30, 30, 30, 35, 40, 45, 55]);
		});

		it('should sort by a single string property', () => {
			const sorted = ArrayComparator.orderBy<User>(compareString(u => u.name)).sort(arr);
			expect(sorted.map(u => u.name)).toEqual(['Alice', 'Bob', 'Dave', 'Eve', 'Frank', 'Jane', 'John', 'John']);
		});

		it('should sort by a nested property', () => {
			const sorted = ArrayComparator.orderBy<User>(compareNumeric(u => u.misc.isActive ? 1 : 0, 'desc')).sort(arr);
			expect(sorted.map(u => u.misc.isActive)).toEqual([true, true, true, true, false, false, false, false]);
		});

		it('should sort by a Date property', () => {
			const sorted = ArrayComparator.orderBy<User>(compareNumeric(u => u.registeredAt.getTime())).sort(arr);
			expect(sorted.map(u => u.registeredAt.getFullYear())).toEqual([2020, 2021, 2021, 2022, 2023, 2024, 2024, 2024]);
		});

		it('should handle null values', () => {
			const sorted = ArrayComparator.orderBy<User>(compareNumeric(u => u.score)).sort(arr);
			expect(sorted.map(u => u.score)).toEqual([50, 50, 100, null, null, null, null, null]);
		});

		it('should perform multi-level sorting', () => {
			const sorted = ArrayComparator.orderBy<User>(compareNumeric(u => u.age))
				.thenBy(compareString(u => u.name))
				.sort(arr);
			expect(sorted.map(u => `${u.age}-${u.name}`)).toEqual([
				'25-Jane', '30-Eve', '30-John', '30-John', '35-Bob', '40-Alice', '45-Dave', '55-Frank'
			]);
		});

		it('should sort in descending order', () => {
			const sorted = ArrayComparator.orderBy<User>('-age').sort(arr);
			expect(sorted.map(u => u.age)).toEqual([55, 45, 40, 35, 30, 30, 30, 25]);
		});

		it('should mix ascending and descending orders in multi-level sorting', () => {
			const sorted = ArrayComparator.orderBy<User>(compareNumeric(u => u.age, 'desc'))
				.thenBy(compareString(u => u.name))
				.sort(arr);
			expect(sorted.map(u => `${u.age}-${u.name}`)).toEqual([
				'55-Frank', '45-Dave', '40-Alice', '35-Bob', '30-Eve', '30-John', '30-John', '25-Jane'
			]);
		});

		it('should sort with a custom comparison function', () => {
			const customCompare = (a: User, b: User) => {
				return (a.name.length - b.name.length) || a.name.localeCompare(b.name);
			};
			const sorted = ArrayComparator.orderBy<User>(customCompare).sort(arr);
			expect(sorted.map(u => u.name)).toEqual(['Bob', 'Eve', 'Dave', 'Jane', 'John', 'John', 'Alice', 'Frank']);
		});

		it('should not modify the original array', () => {
			const arr = [{ prop: 1 }, { prop: 5 }, { prop: 4 }, { prop: 3 }, { prop: 2 }];
			const sorted = ArrayComparator.orderBy<typeof arr[number]>(compareNumeric(u => u.prop, 'desc')).sort(arr);
			const expected = [{ prop: 5 }, { prop: 4 }, { prop: 3 }, { prop: 2 }, { prop: 1 }];
			expect(sorted).toEqual(expected);
			expect(arr).not.toEqual(expected);
		})

	})
})