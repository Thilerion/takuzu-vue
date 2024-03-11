import { EMPTY, ONE, ZERO } from "@/lib/constants.js";
import { generateAllLineCompletions, generateValidLineCompletions } from "@/lib/line-generation/completions.js";
import { generateValidLinesOfSize } from "@/lib/line-generation/lines-of-size.js";
import { generateUniqueArrayPermutations } from "@/lib/line-generation/permutations.js";
import type { PuzzleValueLine } from "@/lib/types.js";
import { splitLine } from "@/lib/utils/puzzle-line.utils.js";

const sorted2dArr = (arr: readonly(readonly (number | string)[])[]) => {
	return arr.map(line => line.join('')).sort();
}

describe('generateUniqueArrayPermutations', () => {
	it('is correct for simple input arrays without duplicate values', () => {
		const inputTwo = [1, 2];
		const expectedTwo = [
			[1, 2], [2, 1]
		];
		expect(generateUniqueArrayPermutations(inputTwo as any[])).toEqual(expectedTwo);

		const inputThree: any[] = [0, 1, 2];
		const expectedThree = [
			[0, 1, 2],
			[0, 2, 1],
			[1, 0, 2],
			[1, 2, 0],
			[2, 1, 0],
			[2, 0, 1]
		];
		expect(generateUniqueArrayPermutations(inputThree)).toEqual(expectedThree);
	})

	it('does not modify the input', () => {
		const input = [1, 2, 3];
		const inputCopy = [...input];
		generateUniqueArrayPermutations(input as any[]);
		expect(input).toEqual(inputCopy);
	})

	it('is correct for inputs with duplicate values', () => {
		const input: PuzzleValueLine = [ZERO, ZERO, ONE];
		const expected = [
			[ZERO, ZERO, ONE],
			[ZERO, ONE, ZERO],
			[ONE, ZERO, ZERO]
		];
		const result = generateUniqueArrayPermutations(input);

		expect(sorted2dArr(result)).toEqual(sorted2dArr(expected));
	})
})

describe('generateValidLinesOfSize', () => {
	it('is correct for standard sized line', () => {
		const result =  generateValidLinesOfSize(4);
		const expected = [
			'0011',
			'0101',
			'0110',
			'1001',
			'1010',
			'1100',
		];
		expect([...result].sort()).toEqual(expected.sort());
	})
	it('is correct for odd-sized line (size 3)', () => {
		const result =  generateValidLinesOfSize(3);
		const expected = [
			'011',
			'101',
			'110'
		];
		expect([...result].sort()).toEqual(expected.sort());
	})
})

describe('generateAllLineCompletions', () => {
	it('is correct for standard line', () => {
		const origLine = splitLine('1...');
		const line = [...origLine];
		const lineCount = {
			[ONE]: 1,
			[ZERO]: 0,
			[EMPTY]: 3
		};
		const result = generateAllLineCompletions(line, lineCount);
		const expected = [
			[ONE, ONE, ZERO, ZERO],
			[ONE, ZERO, ONE, ZERO],
			[ONE, ZERO, ZERO, ONE]
		]
		expect(sorted2dArr(result as any[][])).toEqual(sorted2dArr(expected));
		expect(line).toEqual(origLine); // no side-effects
	})

	it('is correct for an odd-sized line', () => {
		const origLine = splitLine('11...');
		const line = [...origLine];
		const lineCount = {
			[ONE]: 2,
			[ZERO]: 0,
			[EMPTY]: 3
		};

		const result = generateAllLineCompletions(line, lineCount);
		const expected = [
			'11100',
			'11010',
			'11001',
		].map(splitLine);

		expect([...result as any[][]].sort()).toEqual(expected.sort());
	})

	it('calculates lineCount if not provided', () => {
		const inputLine = splitLine('1...');
		const inputCounts = {
			[ONE]: 1,
			[ZERO]: 0,
			[EMPTY]: 3
		};

		const resWith = generateAllLineCompletions(inputLine, inputCounts);
		const resWithout = generateAllLineCompletions(inputLine);

		expect(resWith).toEqual(resWithout);
	})
})

describe('generateValidLineCompletions', () => {
	const linePermArrToSortedStrings = <T>(arr: readonly (readonly T[])[]): string[] => {
		return arr.map(l => l.join('')).sort();
	}

	test('with a filled line', () => {
		const filledLine = splitLine('101010');
		const count = {
			'1': 3,
			'0': 3,
			'.': 0
		};
		const result = generateValidLineCompletions([...filledLine], count);
		expect(result).toEqual([filledLine]);
	})

	test('with an invalid filled line', () => {
		const filledLine = '111010';
		const count = {
			'1': 4,
			'0': 2,
			'.': 0
		};
		const result = generateValidLineCompletions(splitLine(filledLine), count);
		expect(result).toEqual([]);
	})

	test('with an invalid line', () => {
		const line = '111...';
		const count = {
			'1': 3,
			'0': 0,
			'.': 0
		};
		const result = generateValidLineCompletions(splitLine(line), count);
		expect(result).toEqual([]);
	})

	test('with a line of length 6 with some empty cells', () => {
		const line = '..0..1';
		const count = {
			'1': 1,
			'0': 1,
			'.': 4
		}

		const result = generateValidLineCompletions(splitLine(line), count);
		expect(linePermArrToSortedStrings(result)).toEqual([
			'010011',
			'010101',
			'100101'
		].sort())
	})

	test('with a line of length 10 with a single filled cell', () => {
		const line = '.........1';
		const count = {
			'1': 1,
			'0': 0,
			'.': 9
		}
		const allPossibleLinesOfLength10 = generateValidLinesOfSize(10);
		const allPossibleLinesOfLength10EndingInOne = allPossibleLinesOfLength10.filter(l => l.at(-1) === '1');
		const result = generateValidLineCompletions(splitLine(line), count);

		expect(result.length).toBe(allPossibleLinesOfLength10EndingInOne.length);
		expect(linePermArrToSortedStrings(result)).toEqual(allPossibleLinesOfLength10EndingInOne.sort());
	})
})