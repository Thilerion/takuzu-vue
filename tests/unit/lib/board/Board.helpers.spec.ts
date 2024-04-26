import { deducePuzzleDimensions } from "@/lib/board/Board.helpers.js";
import { isExportString } from "@/lib/board/board-conversion.helpers.js";

describe('isExportString', () => {
	test('matches export string', () => {
		expect(isExportString('10x12;01010..')).toBe(true);
	})
	test('is false for other strings', () => {
		expect(isExportString('01001..101010...101.10')).toBe(false);
	})
	test('requires values after the dimensions', () => {
		expect(isExportString('10x12;')).toBe(false);
		expect(isExportString('10x12;010')).toBe(false);
		expect(isExportString('10x12;....')).toBe(true);
	})
	test('requires proper dimensions', () => {
		expect(isExportString('@x@;....')).toBe(false);
		expect(isExportString('x;....')).toBe(false);
		expect(isExportString('1x1;....')).toBe(true);
	})
	test('works multiple times', () => {
		const strA = '10x12;01010101....';

		const resultA = isExportString(strA);
		const resultB = isExportString(strA);
		expect(resultA).toBe(true);
		expect(resultA).toBe(resultB);
	})
	test('is false for strings with additional characters after board string', () => {
		const baseStr = '6x6;1010..1010';
		expect(isExportString(baseStr + ';')).toBe(false);
		expect(isExportString(baseStr + '2')).toBe(false);
		expect(isExportString(baseStr + '..10')).toBe(true);
		expect(isExportString(baseStr + ' ')).toBe(false);
	})
})

describe('deducePuzzleDimensions', () => {
	test('width odd line length', () => {
		const expectVal = (size: number) => ({ width: size, height: size });
		expect(deducePuzzleDimensions(11 * 11)).toStrictEqual(expectVal(11));
		expect(deducePuzzleDimensions(5 * 5)).toStrictEqual(expectVal(5));
		expect(deducePuzzleDimensions(1 * 1)).toStrictEqual(expectVal(1));
	})

	test('with square size', () => {
		const expectVal = (size: number) => ({ width: size, height: size });
		expect(deducePuzzleDimensions(2 * 2)).toStrictEqual(expectVal(2));
		expect(deducePuzzleDimensions(10 * 10)).toStrictEqual(expectVal(10));
		expect(deducePuzzleDimensions(16 * 16)).toStrictEqual(expectVal(16));
		expect(deducePuzzleDimensions(20 * 20)).toStrictEqual(expectVal(20));

		const diffA = deducePuzzleDimensions(16 * 10);
		expect(diffA.width).not.toBeCloseTo(diffA.height);
	})

	test('with rectangular size', () => {
		const expectVal = (width: number, height: number) => ({ width, height });

		expect(deducePuzzleDimensions(10 * 16)).toStrictEqual(expectVal(10, 16));
		expect(deducePuzzleDimensions(12 * 16)).toStrictEqual(expectVal(12, 16));
		expect(deducePuzzleDimensions(4 * 14)).toStrictEqual(expectVal(4, 14));
		expect(deducePuzzleDimensions(6 * 10)).toStrictEqual(expectVal(6, 10));

		expect(() => deducePuzzleDimensions(11 * 12)).toThrow();
	})

	test('with conflictign rectangular size', () => {
		// can be 8x12, but also 6x16
		const result96A = deducePuzzleDimensions(8 * 12);
		const result96B = deducePuzzleDimensions(6 * 16);

		expect(result96B).toStrictEqual(result96A);
		expect(result96A).toStrictEqual({ width: 8, height: 12 });

		const result48A = deducePuzzleDimensions(6 * 8);
		const result48B = deducePuzzleDimensions(4 * 12);

		expect(result48A).toStrictEqual(result48B);
		expect(result48A).toStrictEqual({ width: 6, height: 8 });
	})
})