import { BoardPreset } from "@/config.js";
import { isDifficultyRange, type DifficultyRange, getWeightedBoardShapes, pickRandomDifficultyFromRange, expandDifficultyRange, getDifficultyFromConfAndPreset, getPresetFromConfSize } from "@/features/puzzle-setup/helpers/puzzle-setup-config.js";
import type { BoardShape, DifficultyKey } from "@/lib/types.js";

describe('puzzleSetupConfig helpers', () => {
	test('isDifficultyRange', () => {
		expect(isDifficultyRange(1)).toBe(false);
		expect(isDifficultyRange([1])).toBe(false);
		expect(isDifficultyRange(null)).toBe(false);
		expect(isDifficultyRange([1, 2, 3])).toBe(false);
		expect(isDifficultyRange([1, null])).toBe(false);
		expect(isDifficultyRange([1, 6])).toBe(false);

		// Test that it correctly narrows the type
		const arr: DifficultyKey[] = [1, 5];
		const range: DifficultyRange | null = isDifficultyRange(arr) ? arr : null;
		expect(range).toEqual([1, 5]);
	})

	describe('getWeightedBoardShapes', () => {
		it('returns an array, where items with fewer cells have a higher weight', () => {
			const sizes: BoardShape[] = [
				{ width: 4, height: 4 }, // a > b && a > c
				{ width: 16, height: 16 }, // b < c && b < a
				{ width: 4, height: 10 },
			];
			const result = getWeightedBoardShapes(sizes);
			const [a, b, c] = result;
			expect(a[1]).toBeGreaterThan(b[1]);
			expect(a[1]).toBeGreaterThan(c[1]);

			expect(b[1]).toBeLessThan(c[1]);
			expect(b[1]).toBeLessThan(a[1]);
		})

		it('returns an array with correct weights', () => {
			const sizes: BoardShape[] = [
				{ width: 4, height: 4 },
				{ width: 6, height: 6 },
				{ width: 10, height: 10 },
				{ width: 12, height: 16 },
				{ width: 14, height: 14 }
			];
			const result = getWeightedBoardShapes(sizes);
			expect(result).toMatchInlineSnapshot(`
				[
				  [
				    {
				      "height": 4,
				      "width": 4,
				    },
				    308,
				  ],
				  [
				    {
				      "height": 6,
				      "width": 6,
				    },
				    308,
				  ],
				  [
				    {
				      "height": 10,
				      "width": 10,
				    },
				    100,
				  ],
				  [
				    {
				      "height": 16,
				      "width": 12,
				    },
				    49,
				  ],
				  [
				    {
				      "height": 14,
				      "width": 14,
				    },
				    48,
				  ],
				]
			`);
		})
	})

	describe.todo('pickRandomPresetFromBoardShapes', () => {});

	describe('pickRandomDifficultyFromRange', () => {
		test.todo('throws if min > max');

		it('compares max with preset.maxDifficulty, and throws if all are incompatible', () => {
			const preset = new BoardPreset(4, 4, 3);
			const range: DifficultyRange = [4, 5];
			expect(() => pickRandomDifficultyFromRange(range, preset)).toThrowErrorMatchingInlineSnapshot(`[Error: Selected preset.maxDifficulty is not compatible with the provided DifficultyRange.]`);
		});

		test.todo('picks randomly from list of difficulties');
	});

	describe('expandDifficultyRange', () => {
		it.each<[DifficultyRange, DifficultyKey[]]>([
			[[5, 5], [5]],
			[[1, 2], [1, 2]],
			[[1, 3], [1, 2, 3]],
			[[1, 5], [1, 2, 3, 4, 5]],
		])('correctly expands a range of difficulties', (range, expected) => {
			expect(expandDifficultyRange(range)).toEqual(expected);
		})

		it('throws if the result is not a list of DifficultyKeys', () => {
			expect(() => expandDifficultyRange([0, 2] as any)).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid difficulty key: 0]`);
		})
	});

	describe('getDifficultyFromConfAndPreset', () => {
		it.todo('correctly returns a random difficulty if a range is given');

		it('throws if the provided range is not compatible with the preset', () => {
			const preset = new BoardPreset(4, 4, 2);
			expect(() => getDifficultyFromConfAndPreset({ difficulty: [3, 4] }, preset)).toThrowError();
		})

		it('returns the difficulty if a single difficulty is given', () => {
			const preset = new BoardPreset(4, 4, 3);
			expect(getDifficultyFromConfAndPreset({ difficulty: 1 }, preset)).toBe(1);
		})

		it('throws if the provided single difficulty is not valid for the preset', () => {
			const preset = new BoardPreset(4, 4, 3);
			expect(() => getDifficultyFromConfAndPreset({ difficulty: 5 }, preset)).toThrowError();
		})
	})

	describe('getPresetFromConfSize', () => {
		it.todo('correctly returns a random preset if a list is given');

		it('returns the preset if a single size is given', () => {
			const size: BoardShape = { width: 6, height: 6 };
			const preset = getPresetFromConfSize(size);
			expect(preset).toBeInstanceOf(BoardPreset);
			expect(preset.width).toBe(6);
			expect(preset.height).toBe(6);
		})

		it('throws if the size is not a valid preset', () => {
			expect(() => getPresetFromConfSize({ width: 3, height: 3 })).toThrowError();
		})

		it('throws if the selected size from a list is not a valid preset', () => {
			const sizes: BoardShape[] = [
				{ width: 3, height: 3 },
				{ width: 4, height: 5 }
			]; // none of these are valid presets
			expect(() => getPresetFromConfSize(sizes)).toThrowError();
		})
	})
})