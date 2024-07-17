import { compareByOrder, compareNumeric, compareString, combineCompares, defaultCompareByKey } from "@/utils/orderBy.utils.js";

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
		
		it('should respect locale options', () => {
			const compareA = compareString((val: Record<'a', string>) => val.a);
			expect(compareA({ a: '2' }, { a: '10' })).toBeGreaterThan(0); // default: "2" > "10"

			const compareB = compareString((val: Record<'a', string>) => val.a, { numeric: true });
			expect(compareB({ a: '2' }, { a: '10' })).toBeLessThan(0); // using numeric option: "2" < "10"
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

	describe('orderBy', () => {
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

		it.todo('allows chaining multiple comparison functions', () => {
			expect(arr).toBe(arr)
			/* const sorted = createOrderBy(
				compareNumeric((val: User) => val.age))
				.thenBy(compareNumeric((val) => val.registeredAt.valueOf()))
				.thenBy(compareString((val) => val.name))
				.thenBy(compareNumeric((val) => val.score))
				.sort(arr); */
		})
	})
})