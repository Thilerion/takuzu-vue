import { hFlip, identifyTransform, invertPuzzle, rotate180, rotate270, rotate90, vFlip } from "@/lib/helpers/transformations/transformation-fns";
import type { ROPuzzleGrid } from "@/lib/types";
import { beforeEach, describe, expect, it, test } from "vitest";

type DeepROArr<T> = ReadonlyArray<ReadonlyArray<T>>
const deepFreeze = <T>(grid: T[][]): DeepROArr<T> => {
	const mapped = grid.map(row => Object.freeze(row));
	return Object.freeze(mapped);
}

const getSquareGrid = () => deepFreeze([
	[1, 0, 0, 2],
	[0, 3, 4, 0],
	[0, 5, 6, 0],
	[7, 0, 0, 8],
])
const getRectGrid = () => deepFreeze([
	[1, 0, 0, 2],
	[0, 0, 0, 0],
	[3, 4, 5, 6],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[7, 0, 0, 8],
])
const getOddGrid = () => deepFreeze([
	[1, 2, 3],
	[4, 5, 6],
	[7, 8, 9],
])

describe('puzzle transformationFns', () => {
	let squareGrid: DeepROArr<number>, rectGrid: DeepROArr<number>, oddGrid: DeepROArr<number>;
	beforeEach(() => {
		squareGrid = getSquareGrid();
		rectGrid = getRectGrid();
		oddGrid = getOddGrid();
	})

	test('identityTransform() returns cloned input grid', () => {
		const origGrid = squareGrid.map(row => [...row]);
		const result = identifyTransform(squareGrid);
		expect(result).toStrictEqual(squareGrid);
		result[0].pop();
		expect(squareGrid).toEqual(origGrid);
		expect(result).not.toEqual(squareGrid);
	})

	describe('invertPuzzle()', () => {
		it('returns the same puzzle with 1s and 0s flipped', () => {
			const grid: ROPuzzleGrid = deepFreeze([
				['1', '.'],
				['0', '1'],
			]);
			const expected = [
				['0', '.'],
				['1', '0']
			];
			expect(invertPuzzle(grid)).toEqual(expected);
		})
	})

	describe('reflections', () => {
		test('vFlip()', () => {
			const resultSq = vFlip(squareGrid);
			const resultRect = vFlip(rectGrid);
			const resultOdd = vFlip(oddGrid);
			expect(resultSq).toEqual([
				[7, 0, 0, 8],
				[0, 5, 6, 0],
				[0, 3, 4, 0],
				[1, 0, 0, 2],
			])
			expect(resultRect).toEqual([
				[7, 0, 0, 8],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[3, 4, 5, 6],
				[0, 0, 0, 0],
				[1, 0, 0, 2],
			])
			expect(resultOdd).toEqual([
				[7, 8, 9],
				[4, 5, 6],
				[1, 2, 3]
			])
		})

		test('hFlip()', () => {
			const resultRect = hFlip(rectGrid);
			const resultOdd = hFlip(oddGrid);
			expect(resultRect).toEqual([
				[2, 0, 0, 1],
				[0, 0, 0, 0],
				[6, 5, 4, 3],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[8, 0, 0, 7],
			])
			expect(resultOdd).toEqual([
				[3, 2, 1],
				[6, 5, 4],
				[9, 8, 7],
			])
		})
	})

	describe('rotations', () => {
		test('rotate90()', () => {
			/*
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9], */
			const resultOdd = rotate90(oddGrid);
			expect(resultOdd).toEqual([
				[7, 4, 1],
				[8, 5, 2],
				[9, 6, 3]
			]);
			/* 
			[1, 0, 0, 2],
			[0, 0, 0, 0],
			[3, 4, 5, 6],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[7, 0, 0, 8], */
			const resultRect = rotate90(rectGrid);
			expect(resultRect).toEqual([
				[7, 0, 0, 3, 0, 1],
				[0, 0, 0, 4, 0, 0],
				[0, 0, 0, 5, 0, 0],
				[8, 0, 0, 6, 0, 2],
			])
		})

		test('rotate270()', () => {
			const resultOdd = rotate270(oddGrid);
			expect(resultOdd).toEqual([
				[3, 6, 9],
				[2, 5, 8],
				[1, 4, 7],
			]);
		})

		test('rotate180()', () => {
			const resultOdd = rotate180(oddGrid);
			expect(resultOdd).toEqual([
				[9, 8, 7],
				[6, 5, 4],
				[3, 2, 1],
			]);
		})

		test('rotate270 is rotate90 * 3, and rotate180 is rotate90 * 2', () => {
			const rotate90Results = [
				rotate90(rotate90(squareGrid)),
				rotate90(rotate90(rotate90(oddGrid)))
			];
			expect(rotate180(squareGrid)).toEqual(rotate90Results[0]);
			expect(rotate270(oddGrid)).toEqual(rotate90Results[1]);
		})

		test('rotate180 equals vFlip => hFlip', () => {
			const reflectedA = vFlip(hFlip(rectGrid));
			const reflectedB = hFlip(vFlip(rectGrid));
			const rotated = rotate180(rectGrid);
			expect(rotated).toEqual(reflectedA);
			expect(rotated).toEqual(reflectedB);
		})
	})
})