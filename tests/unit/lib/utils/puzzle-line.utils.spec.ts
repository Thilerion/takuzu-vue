import { EMPTY, ONE, ZERO } from "@/lib/constants.js";
import { areLinesEqual, columnIdToX, countLineValues, getLineDataFromId, isLineIdColumn, isLineIdRow, isPuzzleSymbolLineStr, isPuzzleValueLineStr, lineSizeToNumRequired, lineTypeFromLineId, rowIdToY, sortLineValues, splitLine, xToColumnId, yToRowId } from "@/lib/utils/puzzle-line.utils.js";

describe('puzzle-line utils', () => {
	test('isPuzzleValueLineStr()', () => {
		expect(isPuzzleValueLineStr('1.0.0')).toBe(true);
		expect(isPuzzleValueLineStr('101010')).toBe(true);
		expect(isPuzzleValueLineStr('1111')).toBe(true);
		expect(isPuzzleValueLineStr('..')).toBe(true);
		
		expect(isPuzzleValueLineStr('')).toBe(false);
		expect(isPuzzleValueLineStr('1.0 .1')).toBe(false);
	})
	test('isPuzzleSymbolLineStr()', () => {
		expect(isPuzzleSymbolLineStr('1.0.0')).toBe(false);
		expect(isPuzzleSymbolLineStr('101010')).toBe(true);
		expect(isPuzzleSymbolLineStr('1111')).toBe(true);
		expect(isPuzzleSymbolLineStr('..')).toBe(false);
		
		expect(isPuzzleSymbolLineStr('')).toBe(false);
		expect(isPuzzleSymbolLineStr('1.0 .1')).toBe(false);
	})

	test('lineSizeToNumRequired()', () => {
		expect(lineSizeToNumRequired(4)).toEqual({ [ONE]: 2, [ZERO]: 2 });
		// One more "1" than "0" when line size is odd
		expect(lineSizeToNumRequired(5)).toEqual({ [ONE]: 3, [ZERO]: 2 });

		expect(lineSizeToNumRequired(1000)).toEqual({ [ONE]: 500, [ZERO]: 500 });
		expect(lineSizeToNumRequired(0)).toEqual({ [ONE]: 0, [ZERO]: 0 });
	})

	test('countLineValues() counts the 0s, 1s, and empty cells in a line', () => {
		expect(countLineValues(splitLine('1.0.0...'))).toEqual({ [ONE]: 1, [ZERO]: 2, [EMPTY]: 5 });
		expect(countLineValues(splitLine(''))).toEqual({ [ONE]: 0, [ZERO]: 0, [EMPTY]: 0 });
		expect(countLineValues(splitLine('...'))).toEqual({ [ONE]: 0, [ZERO]: 0, [EMPTY]: 3 });
	})

	test('areLinesEqual() correctly compares two puzzle lines', () => {
		expect(areLinesEqual(
			// @ts-expect-error testing with numbers
			[1, 2, 3, 4, 5],
			[1, 2, 3, 5, 4]
		)).toBe(false);

		expect(areLinesEqual(
			// @ts-expect-error testing with numbers, booleans, and null
			[true, null, -1, ONE, ZERO, EMPTY],
			[true, null, -1, ONE, ZERO, EMPTY]
		)).toBe(true);
	})

	describe('lineId utilities', () => {
		test('rowIdToY', () => {
			expect(rowIdToY('A')).toBe(0);
			expect(rowIdToY('B')).toBe(1);
			expect(rowIdToY('Z')).toBe(25);
		})
		test('yToRowId', () => {
			expect(yToRowId(0)).toBe('A');
			expect(yToRowId(25)).toBe('Z');
		})
		test('yToRowId throws an error if output would be > "Z" or < "A"', () => {
			expect(yToRowId(25)).toBe('Z');
			expect(() => yToRowId(26)).toThrow();
			expect(() => yToRowId(-1)).toThrow();
		})

		test('columnIdToX', () => {
			expect(columnIdToX('1')).toBe(0);
			expect(columnIdToX('2')).toBe(1);
			expect(columnIdToX('9')).toBe(8);
		})
		test('xToColumnId', () => {
			expect(xToColumnId(0)).toBe('1');
			expect(xToColumnId(8)).toBe('9');
		})

		test('isLineIdRow is true only for a single char in range A-Z', () => {
			expect(isLineIdRow('A')).toBe(true);
			expect(isLineIdRow('Z')).toBe(true);

			expect(isLineIdRow('AA')).toBe(false);
			expect(isLineIdRow('a')).toBe(false);
			expect(isLineIdRow('0')).toBe(false);
			expect(isLineIdRow('')).toBe(false);
			expect(isLineIdRow('A ')).toBe(false);
			expect(isLineIdRow('\nA')).toBe(false);
		})

		test('isLineIdColumn is true for any number converted to string', () => {
			expect(isLineIdColumn('0')).toBe(true);
			expect(isLineIdColumn('9')).toBe(true);
			expect(isLineIdColumn('10')).toBe(true);
			expect(isLineIdColumn('100')).toBe(true);

			expect(isLineIdColumn('A')).toBe(false);
			expect(isLineIdColumn('')).toBe(false);
			expect(isLineIdColumn('0.5')).toBe(false);
			expect(isLineIdColumn('1e20')).toBe(false);
		})

		test('lineTypeFromLineId()', () => {
			const resRow = lineTypeFromLineId('A');
			expect(resRow).toBe('row');

			const resCol = lineTypeFromLineId('1');
			expect(resCol).toBe('column');
		})

		test('lineDataFromLineId()', () => {
			expect(getLineDataFromId('A')).toEqual({ lineType: 'row', lineId: 'A' });
			expect(getLineDataFromId('1')).toEqual({ lineType: 'column', lineId: '1' });
			expect(() => getLineDataFromId('AA')).toThrow();
		})

		test('sortLineValues sorts a puzzle line in a predictable way', () => {
			expect(sortLineValues(
				[ONE, ZERO, ONE, EMPTY, ONE, ZERO, ZERO, EMPTY]
			)).toEqual([ZERO, ZERO, ZERO, ONE, ONE, ONE, EMPTY, EMPTY])
		})

		describe('splitLine()', () => {
			let previousDevMode: boolean;
			beforeAll(() => {
				previousDevMode = import.meta.env.DEV;
			})
			afterAll(() => {
				import.meta.env.DEV = previousDevMode;
			})

			it('splits a string normally when not in DEV mode', () => {
				import.meta.env.DEV = false;

				expect(splitLine('1.0.')).toEqual([ONE, EMPTY, ZERO, EMPTY]);
				expect(splitLine('')).toEqual([]);
				expect(splitLine('abc')).toEqual('abc'.split(''));
			})
			it('validates a string when in DEV mode', () => {
				import.meta.env.DEV = true;

				expect(splitLine('1.0.')).toEqual([ONE, EMPTY, ZERO, EMPTY]);
				expect(splitLine('')).toEqual([]);
				expect(() => splitLine('abc')).toThrowErrorMatchingInlineSnapshot(`[Error: Can only call split line with ValueLineStr or SymbolLineStr. Unexpected char: "a"]`);
			})
		})
	})
})