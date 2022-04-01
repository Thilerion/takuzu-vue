import { expect, it, beforeEach, test, describe } from 'vitest';
import permuteUnique from '../../../../src/lib/permutations/permute';

function joinAndSort(result) {
	return result.map(r => r.join('')).sort();
}

describe('permuteUnique', () => {
	test('A', () => {
		const arr = [0, 0, 1];
		const expected = [
			'001', '010', '100'
		];
		expect(joinAndSort(permuteUnique(arr))).toEqual(expected.sort());
	})

	test('B', () => {
		const arr = [0];
		const expected = ['0'];
		expect(joinAndSort(permuteUnique(arr))).toEqual(expected.sort());
	})

	test('C', () => {
		const arr = [0, 0, 0, 1, 1, 2];
		const result = permuteUnique(arr);
		expect(result).toHaveLength(60);
	})

	test('D', () => {
		const arr = [0, 0, 0, 0, 1];
		const expected = [
			'00001',
			'00010',
			'00100',
			'01000',
			'10000',
		].sort();
		expect(joinAndSort(permuteUnique(arr))).toEqual(expected);
	})
})