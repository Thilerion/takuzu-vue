import { expect, it, beforeEach, test, describe } from 'vitest';
import { EMPTY, ONE, ZERO } from '../../../../src/lib/constants';
import { getEmptyLinePermutations, getLinePermutations, getArrayPermutations, getValidLinePermutations } from '../../../../src/lib/permutations';

const clearAllCaches = () => {
	[getEmptyLinePermutations, getLinePermutations, getArrayPermutations, getValidLinePermutations].forEach(memoizedFn => {
		memoizedFn.cache.clear();
	})
}

describe('getArrayPermutations', () => {
	beforeEach(() => {
		clearAllCaches();
	})

	it('is correct for simple inputs', () => {
		const testCases = [
			{
				input: [1, 2],
				expected: [
					[1, 2], [2, 1]
				]
			},
			{
				input: [0, 1, 2],
				expected: [
					[0, 1, 2],
					[0, 2, 1],
					[1, 0, 2],
					[1, 2, 0],
					[2, 1, 0],
					[2, 0, 1]
				]
			},
		];
		for (const { input, expected } of testCases) {
			const result = getArrayPermutations(input);
			expect(result.sort()).toEqual(expected.sort());
		}
	})

	it('is correct for inputs with duplicates', () => {
		const input = [0, 0, 1];
		const expected = [
			[0, 0, 1],
			[0, 1, 0],
			[1, 0, 0]
		];
		expect(getArrayPermutations(input).sort()).toEqual(expected.sort());
	})
})

describe('getEmptyLinePermutations', () => {
	beforeEach(() => {
		clearAllCaches();
	})


	describe('without initial cache', () => {
	
		it('is correct for standard sized line', () => {
			const result =  getEmptyLinePermutations(4);
			const expected = [
				'0011',
				'0101',
				'0110',
				'1001',
				'1010',
				'1100',
			];
			expect(result.sort()).toEqual(expected.sort());
		})
		it('is correct for odd-sized line (size 3)', () => {
			const result =  getEmptyLinePermutations(3);
			const expected = [
				'011',
				'101',
				'110'
			];
			expect(result.sort()).toEqual(expected.sort());
		})

	})

})


describe('getLinePermutations', () => {
	beforeEach(() => {
		clearAllCaches();
	})


	it('is correct for standard line', () => {
		const origLine = [ONE, EMPTY, EMPTY, EMPTY];
		const line = [...origLine];
		const lineCount = {
			[ONE]: 1,
			[ZERO]: 0,
			[EMPTY]: 3
		};
	
		const result = getLinePermutations(line, lineCount);
		const expected = [
			[ONE, ONE, ZERO, ZERO],
			[ONE, ZERO, ONE, ZERO],
			[ONE, ZERO, ZERO, ONE]
		]
	
		expect(result.sort()).toEqual(expected.sort());
		expect(line).toEqual(origLine); // no side-effects
	})
	
	it('is correct for odd-sized line', () => {
		const origLine = [ONE, ONE, EMPTY, EMPTY, EMPTY];
		const line = [...origLine];
		const lineCount = {
			[ONE]: 2,
			[ZERO]: 0,
			[EMPTY]: 3
		};
	
		const result = getLinePermutations(line, lineCount);
		const expected = [
			[ONE, ONE, ONE, ZERO, ZERO],
			[ONE, ONE, ZERO, ONE, ZERO],
			[ONE, ONE, ZERO, ZERO, ONE]
		]
	
		expect(result.sort()).toEqual(expected.sort());
		expect(line).toEqual(origLine); // no side-effects
	})

	it('calculates lineCount itself if not supplied', () => {
		const inputLine = '1...'.split('');
		const inputCounts = { '1': 1, '0': 0, '.': 3 };
		const expected = [
			'1100'.split(''),
			'1010'.split(''),
			'1001'.split('')
		].sort();

		const resultWith = getLinePermutations(inputLine, inputCounts).sort();
		const resultWithout = getLinePermutations(inputLine).sort();

		expect(resultWith).toEqual(expected);
		expect(resultWith).toBe(resultWithout);
	})

	test('matches snapshot', () => {
		const line = ['.', '0', '0', '.', '1', '0', '.', '.'];
		expect(getLinePermutations(line)).toMatchInlineSnapshot(`
			[
			  [
			    "0",
			    "0",
			    "0",
			    "1",
			    "1",
			    "0",
			    "1",
			    "1",
			  ],
			  [
			    "1",
			    "0",
			    "0",
			    "0",
			    "1",
			    "0",
			    "1",
			    "1",
			  ],
			  [
			    "1",
			    "0",
			    "0",
			    "1",
			    "1",
			    "0",
			    "0",
			    "1",
			  ],
			  [
			    "1",
			    "0",
			    "0",
			    "1",
			    "1",
			    "0",
			    "1",
			    "0",
			  ],
			]
		`);
	})
})

test.todo('permutation functions use cache');
test.todo('getValidLinePermutations');