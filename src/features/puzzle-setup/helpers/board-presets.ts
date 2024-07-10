import { BoardPreset, PRESET_BOARD_SIZES, type BoardType, isDifficultyKey } from "@/config.js";
import type { BoardShape, DifficultyKey } from "@/lib/types.js";
import { isDifficultyRange, type DifficultyRange } from "../composables/puzzle-setup-state.js";

/**
 * Ensures that the combination of selected size(s) and difficulty/ies is valid.
 * A user can select multiple difficulties, and then multiple sizes.
 * 
 * The function should validate that:
 * a. For each selected size, one of the BoardPresets matches it.
 * b. For each selected size, at least one of the chosen difficulties is valid (not greater than the maxDifficulty).
 * c. For each selected difficulty, there's at least one chosen size that can accommodate it.
 */
export function isValidSizeDifficultyCombination(
	size: BoardShape | BoardShape[],
	difficulty: DifficultyKey | DifficultyKey[]
): boolean {
	const sizes = Array.isArray(size) ? size : [size];
	const diffs = Array.isArray(difficulty) ? difficulty : [difficulty];

	if (sizes.length === 0 || diffs.length === 0) return false;

	// Check if each size is a valid option according to list of BoardPresets
	const sizePresets: BoardPreset[] = [];
	for (const s of sizes) {
		const preset = PRESET_BOARD_SIZES.find(p => p.width === s.width && p.height === s.height);
		if (!preset) return false;
		sizePresets.push(preset);
	}

	// Check if each size has at least one valid difficulty
	const allSizesValid = sizePresets.every(p => presetMatchesAtLeastOneDifficulty(p, diffs));
	if (!allSizesValid) return false;

	// Check if each difficulty is valid for at least one size
	const allDiffsValid = diffs.every(d => atLeastOnePresetAccomodatesDifficulty(sizePresets, d));
	if (!allDiffsValid) return false;

	return true;
}

export function isValidNewPuzzleSetup(
	size: BoardShape | ReadonlyArray<BoardShape>,
	difficulty: DifficultyKey | DifficultyRange
): boolean {
	if (Array.isArray(size) && size.length === 0) return false;
	if (Array.isArray(difficulty) && !isDifficultyRange(difficulty)) return false;
	if (!validateDifficultySetup(difficulty)) return false;
	
	// Check if each size is a valid option according to list of BoardPresets
	const sizes = Array.isArray(size) ? size : [size];
	const sizePresets: BoardPreset[] = [];
	for (const s of sizes) {
		const preset = PRESET_BOARD_SIZES.find(p => p.width === s.width && p.height === s.height);
		if (!preset) return false;
		sizePresets.push(preset);
	}

	const diffs = Array.isArray(difficulty) ? getDifficultiesFromDifficultyRange(difficulty) : ([difficulty] as DifficultyKey[]);
	// Check if each size has at least one valid difficulty
	const allSizesValid = sizePresets.every(p => presetMatchesAtLeastOneDifficulty(p, diffs));
	if (!allSizesValid) return false;

	return true;
}

const validateDifficultySetup = (difficulty: DifficultyKey | DifficultyRange): boolean => {
	const diffs = Array.isArray(difficulty) ? difficulty : [difficulty];
	return diffs.every(d => isDifficultyKey(d));
}

export function getValidPresetsForDifficulty(difficulty: DifficultyKey | DifficultyKey[]) {
	const diffs = Array.isArray(difficulty) ? difficulty : [difficulty];
	return PRESET_BOARD_SIZES.filter(preset => presetMatchesAtLeastOneDifficulty(preset, diffs))
}

export function presetMatchesAtLeastOneDifficulty(preset: BoardPreset, difficulties: DifficultyKey[]): boolean {
	return difficulties.some(d => d <= preset.maxDifficulty);
}
export function atLeastOnePresetAccomodatesDifficulty(presets: BoardPreset[], difficulty: DifficultyKey): boolean {
	return presets.some(p => difficulty <= p.maxDifficulty);
}

export function sortPresetsByTypeAndSize(presets: BoardPreset[]): BoardPreset[] {
	const orderOfTypes: BoardType[] = ['Normal', 'Rectangular', 'Odd'];
	// First by type: Normal, Rect, Odd
	// Then by size: smallest to largest (width x height)
	return [...presets].sort((a, b) => {
		if (a.type === b.type) {
			const cellsA = a.width * a.height;
			const cellsB = b.width * b.height;
			return cellsA - cellsB;
		}
		return orderOfTypes.indexOf(a.type) - orderOfTypes.indexOf(b.type);
	})
}

export function getDifficultiesFromDifficultyRange(range: DifficultyRange): DifficultyKey[] {
	const [min, max] = range;
	if (min === max) return [min];
	const result: DifficultyKey[] = [];
	for (let i = min; i <= max; i++) {
		if (!isDifficultyKey(i)) throw new Error(`Invalid difficulty key: ${i}`);
		result.push(i);
	}
	return result;
}