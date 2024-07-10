import { BoardPreset, PRESET_BOARD_SIZES, type BoardType, isDifficultyKey } from "@/config.js";
import type { BoardShape, DifficultyKey } from "@/lib/types.js";
import { isDifficultyRange, type DifficultyRange } from "../composables/puzzle-setup-state.js";

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

export function getPresetFromBoardShape(shape: BoardShape): BoardPreset | null {
	return PRESET_BOARD_SIZES.find(p => p.width === shape.width && p.height === shape.height) ?? null;
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