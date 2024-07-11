import { BoardPreset, PRESET_BOARD_SIZES, type BoardType } from "@/config.js"
import { atLeastOnePresetAccomodatesDifficulty, getValidPresetsForDifficulty, presetMatchesAtLeastOneDifficulty, sortPresetsByTypeAndSize } from "@/features/puzzle-setup/helpers/board-presets.js";

describe('board-presets helpers', () => {

	describe('sortPresetsByTypeAndSize', () => {
		it('sorts presets by type first', () => {
			const presets: { type: BoardType }[] = [
				{ type: 'Odd' },
				{ type: 'Rectangular' },
				{ type: 'Normal' },
			];
			const sorted = sortPresetsByTypeAndSize(presets as BoardPreset[]);
			expect(sorted).toEqual([
				{ type: 'Normal' },
				{ type: 'Rectangular' },
				{ type: 'Odd' },
			]);
		})

		it('sorts presets of the same type by number of cells', () => {
			const presets = [
				new BoardPreset(6, 6, 5),
				new BoardPreset(14, 14, 5),
				new BoardPreset(10, 10, 2),
				new BoardPreset(4, 4, 1)
			];
			const sorted = sortPresetsByTypeAndSize(presets);
			expect(sorted).toEqual([
				new BoardPreset(4, 4, 1),
				new BoardPreset(6, 6, 5),
				new BoardPreset(10, 10, 2),
				new BoardPreset(14, 14, 5),
			]);
		})

		it('sorts presets by type, then by size', () => {
			const presets = [
				new BoardPreset(5, 5, 1),
				new BoardPreset(10, 14, 5),
				new BoardPreset(10, 10, 2),
				new BoardPreset(4, 4, 1),
				new BoardPreset(13, 13, 5),
			];
			const sorted = sortPresetsByTypeAndSize(presets);
			expect(sorted).toEqual([
				new BoardPreset(4, 4, 1),
				new BoardPreset(10, 10, 2),

				new BoardPreset(10, 14, 5),

				new BoardPreset(5, 5, 1),
				new BoardPreset(13, 13, 5),
			]);
		})
	})

	describe('preset+difficulty matchers', () => {
		test('presetMatchesAtLeastOneDifficulty checks if at least one of the difficulties is compatible with the preset', () => {
			const preset = new BoardPreset(6, 6, 3);
			expect(presetMatchesAtLeastOneDifficulty(preset, [1, 2, 3])).toBe(true);
			expect(presetMatchesAtLeastOneDifficulty(preset, [3])).toBe(true);
			expect(presetMatchesAtLeastOneDifficulty(preset, [4])).toBe(false);
			expect(presetMatchesAtLeastOneDifficulty(preset, [4, 5])).toBe(false);
		})

		test('atLeastOnePresetAccomodatesDifficulty checks if a given difficulty is compatible with at least one preset', () => {
			const presets = [
				new BoardPreset(6, 6, 1),
				new BoardPreset(6, 6, 3),
			]; // presets are compatible with difficulties 1, 2, 3
			expect(atLeastOnePresetAccomodatesDifficulty(presets, 1)).toBe(true);
			expect(atLeastOnePresetAccomodatesDifficulty(presets, 2)).toBe(true);
			expect(atLeastOnePresetAccomodatesDifficulty(presets, 3)).toBe(true);
			expect(atLeastOnePresetAccomodatesDifficulty(presets, 4)).toBe(false);
			expect(atLeastOnePresetAccomodatesDifficulty(presets, 5)).toBe(false);
		})
	})

	describe('getValidPresetsForDifficulty', () => {
		it('gets all presets that match the given difficulty or difficulties', () => {
			const presets = [
				new BoardPreset(6, 6, 1),
				new BoardPreset(8, 8, 1),
				new BoardPreset(6, 6, 3),
				new BoardPreset(9, 9, 3),
				new BoardPreset(6, 6, 4),
			]
			const resA = getValidPresetsForDifficulty(1, [...presets]);
			expect(resA).toEqual(presets);

			const resB = getValidPresetsForDifficulty(5, [...presets]);
			expect(resB).toEqual([]);

			const resC = getValidPresetsForDifficulty([3, 4, 5], [...presets]);
			expect(resC).toEqual([
				new BoardPreset(6, 6, 3),
				new BoardPreset(9, 9, 3),
				new BoardPreset(6, 6, 4),
			])

			const resD = getValidPresetsForDifficulty([3, 5], [...presets]);
			expect(resD).toEqual([
				new BoardPreset(6, 6, 3),
				new BoardPreset(9, 9, 3),
				new BoardPreset(6, 6, 4),
			])

			const resE = getValidPresetsForDifficulty([1, 5], [...presets]);
			expect(resE).toEqual([...presets]);
		})

		it('defaults to PRESET_BOARD_SIZES set in @/config.ts', () => {
			expect(getValidPresetsForDifficulty(1)).toEqual(PRESET_BOARD_SIZES);
		})
	})
})