import { expandPuzzleString, puzzleGridToString, puzzleStringToGrid, shortenPuzzleString, toSingleDigitSequence } from '@/components/puzzle-input/convert';
import type { PuzzleInputGrid } from '@/components/puzzle-input/types.js';
import { EMPTY } from '@/lib/constants';
import { describe, expect, test } from 'vitest';

describe('puzzle input conversion helpers', () => {
	const testCases = [
		[
			'Simple 6x6 puzzle',
			{
				strLong: '....01..0.0..........0.1.1...1.1....',
				strLongNoPad: '....01..0.0..........0.1.1...1.1',
				dimensions: { width: 6, height: 6 },
				strShortNoPad: '40120.0550.1.131.1',
				strShort: '40120.0550.1.131.14',
				grid: [
					'....01',
					'..0.0.',
					'......',
					'...0.1',
					'.1...1',
					'.1....',
				].map(row => row.split('')) as PuzzleInputGrid
			}
		],
		[
			'Rectangular puzzle',
			{
				strLong: '..1............0......1......0.0...0....1.......0..00..11.1.',
				strLongNoPad: '..1............0......1......0.0...0....1.......0..00..11.1',
				strShort: '216606160.0304170200211.1.',
				strShortNoPad: '216606160.0304170200211.1',
				dimensions: { width: 6, height: 10 },
				grid: [
					'..1...',
					'......',
					'...0..',
					'....1.',
					'.....0',
					'.0...0',
					'....1.',
					'......',
					'0..00.',
					'.11.1.',
				].map(row => row.split('')) as PuzzleInputGrid
			}
		],
		[
			'Simple puzzle where start and end have values',
			{
				strLong: '0..1..1...1..1.....1....0......00..1',
				strLongNoPad: '0..1..1...1..1.....1....0......00..1',
				dimensions: { width: 6, height: 6 },
				strShortNoPad: '021213121514060021',
				strShort: '021213121514060021',
				grid: [
					'0..1..',
					'1...1.',
					'.1....',
					'.1....',
					'0.....',
					'.00..1',
				].map(row => row.split('')) as PuzzleInputGrid
			}
		]
	] as const;

	describe('toSingleDigitSequence', () => {
		test('with single is just the EMPTY character', () =>{
			expect(toSingleDigitSequence(1)).toBe(EMPTY);
		})
		test('with 0 returns empty string', () => {
			expect(toSingleDigitSequence(0)).toBe('');
		})
		test('throws with invalid numbers', () => {
			// @ts-expect-error testing invalid inputs
			expect(() => toSingleDigitSequence()).toThrow(TypeError);
			expect(() => toSingleDigitSequence(-1)).toThrow(TypeError);
			// @ts-expect-error testing invalid inputs
			expect(() => toSingleDigitSequence('x')).toThrow(TypeError);
		})
		test('correct for values lower than 10', () => {
			expect(toSingleDigitSequence(5)).toBe('5');
		})
		test('correct for values higher than 9', () => {
			expect(toSingleDigitSequence(10)).toBe('55');
			expect(toSingleDigitSequence(20)).toBe('965');
			expect(toSingleDigitSequence(21)).toBe('966');
		})
	})

	describe('shorten puzzle string', () => {

		test('with simple 6x6 puzzle', () => {
			const testCase = testCases[0];
			const { strLong, strLongNoPad, dimensions, strShortNoPad, strShort } = testCase[1];
			expect(shortenPuzzleString(strLong, dimensions)).toBe(strShortNoPad);
			expect(shortenPuzzleString(strLong, dimensions, { padEnd: true })).toBe(strShort);

			expect(shortenPuzzleString(strLongNoPad, dimensions)).toBe(strShortNoPad);
			expect(shortenPuzzleString(strLongNoPad, dimensions, { padEnd: true })).toBe(strShort);
		})

		test('with rectangular puzzle', () => {
			const testCase = testCases[1];
			const { strLong, strLongNoPad, dimensions, strShortNoPad, strShort } = testCase[1];
			expect(shortenPuzzleString(strLong, dimensions)).toBe(strShortNoPad);
			expect(shortenPuzzleString(strLong, dimensions, { padEnd: true })).toBe(strShort);

			expect(shortenPuzzleString(strLongNoPad, dimensions)).toBe(strShortNoPad);
			expect(shortenPuzzleString(strLongNoPad, dimensions, { padEnd: true })).toBe(strShort);
		})

		test('with simple puzzle where start and end have values', () => {
			const testCase = testCases[2];
			const { strLong, strLongNoPad, dimensions, strShortNoPad, strShort } = testCase[1];
			expect(shortenPuzzleString(strLong, dimensions)).toBe(strShortNoPad);
			expect(shortenPuzzleString(strLong, dimensions, { padEnd: true })).toBe(strShort);

			expect(shortenPuzzleString(strLongNoPad, dimensions)).toBe(strShortNoPad);
			expect(shortenPuzzleString(strLongNoPad, dimensions, { padEnd: true })).toBe(strShort);
		})
	})

	describe('expand puzzle string', () => {
		test('with simple 6x6 puzzle', () => {
			const testCase = testCases[0];
			const { strLong, strLongNoPad, dimensions, strShortNoPad, strShort } = testCase[1];
			expect(expandPuzzleString(strShortNoPad, dimensions)).toBe(strLong);
			expect(expandPuzzleString(strShort, dimensions)).toBe(strLong);
			expect(expandPuzzleString(strLong, dimensions)).toBe(strLong);
			expect(expandPuzzleString(strLongNoPad, dimensions)).toBe(strLong);
		})

		test('with rectangular puzzle', () => {
			const testCase = testCases[1];
			const { strLong, strLongNoPad, dimensions, strShortNoPad, strShort } = testCase[1];
			expect(expandPuzzleString(strShortNoPad, dimensions)).toBe(strLong);
			expect(expandPuzzleString(strShort, dimensions)).toBe(strLong);
			expect(expandPuzzleString(strLong, dimensions)).toBe(strLong);
			expect(expandPuzzleString(strLongNoPad, dimensions)).toBe(strLong);
		})

		test('with simple puzzle where start and end have values', () => {
			const testCase = testCases[2];
			const { strLong, strLongNoPad, dimensions, strShortNoPad, strShort } = testCase[1];
			expect(expandPuzzleString(strShortNoPad, dimensions)).toBe(strLong);
			expect(expandPuzzleString(strShort, dimensions)).toBe(strLong);
			expect(expandPuzzleString(strLong, dimensions)).toBe(strLong);
			expect(expandPuzzleString(strLongNoPad, dimensions)).toBe(strLong);
		})
	})

	describe('puzzleGridToString and puzzleStringToGrid', () => {
		test('with simple 6x6 puzzle', () => {
			const testCase = testCases[0];
			const { grid, dimensions, strShortNoPad, strLong } = testCase[1];

			const asShortString = puzzleGridToString(grid, dimensions, { shorten: true });
			const asExpandedString = puzzleGridToString(grid, dimensions, { shorten: false });
			expect(asShortString).toBe(strShortNoPad);
			expect(asExpandedString).toBe(strLong);

			expect(puzzleStringToGrid(asShortString, dimensions)).toEqual(grid);
			expect(puzzleStringToGrid(asExpandedString, dimensions)).toEqual(grid);
		})

		test('with rectangular puzzle', () => {
			const testCase = testCases[1];
			const { grid, dimensions, strShortNoPad, strLong } = testCase[1];

			const asShortString = puzzleGridToString(grid, dimensions, { shorten: true });
			const asExpandedString = puzzleGridToString(grid, dimensions, { shorten: false });
			expect(asShortString).toBe(strShortNoPad);
			expect(asExpandedString).toBe(strLong);

			expect(puzzleStringToGrid(asShortString, dimensions)).toEqual(grid);
			expect(puzzleStringToGrid(asExpandedString, dimensions)).toEqual(grid);
		})

		test('with simple puzzle where start and end have values', () => {
			const testCase = testCases[2];
			const { grid, dimensions, strShortNoPad, strLong } = testCase[1];

			const asShortString = puzzleGridToString(grid, dimensions, { shorten: true });
			const asExpandedString = puzzleGridToString(grid, dimensions, { shorten: false });
			expect(asShortString).toBe(strShortNoPad);
			expect(asExpandedString).toBe(strLong);

			expect(puzzleStringToGrid(asShortString, dimensions)).toEqual(grid);
			expect(puzzleStringToGrid(asExpandedString, dimensions)).toEqual(grid);
		})
	})

})