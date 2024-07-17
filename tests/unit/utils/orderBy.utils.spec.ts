import { compareByOrder, compareNumeric, compareString, combineCompares } from "@/utils/orderBy.utils.js";

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
	})

	describe('compareByOrder', () => {
		it('should compare by a specific order', () => {
			const order = [1, 3, 2];
			const compare = compareByOrder((val: Record<'a', number>) => val.a, order);
			expect(compare({ a: 1 }, { a: 2 })).toBeLessThan(0);
			expect(compare({ a: 2 }, { a: 1 })).toBeGreaterThan(0);
			expect(compare({ a: 2 }, { a: 3 })).toBeGreaterThan(0);
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
			expect(result).toMatchInlineSnapshot(`
				[
				  {
				    "difficulty": 1,
				    "size": 4,
				    "type": "Normal",
				  },
				  {
				    "difficulty": 1,
				    "size": 4,
				    "type": "Odd",
				  },
				  {
				    "difficulty": 1,
				    "size": 4,
				    "type": "Rect",
				  },
				  {
				    "difficulty": 1,
				    "size": 6,
				    "type": "Rect",
				  },
				  {
				    "difficulty": 1,
				    "size": 8,
				    "type": "Rect",
				  },
				  {
				    "difficulty": 1,
				    "size": 10,
				    "type": "Normal",
				  },
				  {
				    "difficulty": 1,
				    "size": 10,
				    "type": "Odd",
				  },
				  {
				    "difficulty": 2,
				    "size": 10,
				    "type": "Normal",
				  },
				  {
				    "difficulty": 2,
				    "size": 10,
				    "type": "Odd",
				  },
				  {
				    "difficulty": 3,
				    "size": 10,
				    "type": "Normal",
				  },
				  {
				    "difficulty": 3,
				    "size": 10,
				    "type": "Odd",
				  },
				]
			`);
		})
	})
})