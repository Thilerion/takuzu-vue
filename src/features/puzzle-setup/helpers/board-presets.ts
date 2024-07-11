import { BoardPreset, PRESET_BOARD_SIZES, type BoardType } from "@/config.js";
import type { BoardShape, DifficultyKey } from "@/lib/types.js";
import { type DifficultyRange, isDifficultyRange, expandDifficultyRange } from "./puzzle-setup-config.js";

// TODO: move to correct file/module
export function isValidNewPuzzleSetup(
	size: BoardShape | ReadonlyArray<BoardShape>,
	difficulty: DifficultyKey | DifficultyRange
): boolean {
	if (Array.isArray(size) && size.length === 0) return false;
	if (Array.isArray(difficulty) && !isDifficultyRange(difficulty)) return false;
	
	// Check if each size is a valid option according to list of BoardPresets
	const sizes = Array.isArray(size) ? size : [size];
	const sizePresets: BoardPreset[] = [];
	for (const s of sizes) {
		const preset = PRESET_BOARD_SIZES.find(p => p.width === s.width && p.height === s.height);
		if (!preset) return false;
		sizePresets.push(preset);
	}

	const diffs = Array.isArray(difficulty) ? expandDifficultyRange(difficulty) : ([difficulty] as DifficultyKey[]);
	// Check if each size has at least one valid difficulty
	const allSizesValid = sizePresets.every(p => presetMatchesAtLeastOneDifficulty(p, diffs));
	if (!allSizesValid) return false;

	return true;
}

export function getPresetFromBoardShape(shape: BoardShape): BoardPreset | null {
	return PRESET_BOARD_SIZES.find(p => p.width === shape.width && p.height === shape.height) ?? null;
}

export function getValidPresetsForDifficulty(
	difficulty: DifficultyKey | DifficultyKey[],
	allPresets = PRESET_BOARD_SIZES
) {
	const diffs = Array.isArray(difficulty) ? difficulty : [difficulty];
	return allPresets.filter(preset => presetMatchesAtLeastOneDifficulty(preset, diffs))
}

export function presetMatchesAtLeastOneDifficulty(preset: BoardPreset, difficulties: DifficultyKey[]): boolean {
	return difficulties.some(d => preset.isCompatibleWithDifficulty(d));
}
export function atLeastOnePresetAccomodatesDifficulty(presets: BoardPreset[], difficulty: DifficultyKey): boolean {
	return presets.some(p => p.isCompatibleWithDifficulty(difficulty));
}

const orderOfPresetTypes: Record<BoardType, number> = {
	'Normal': 0,
	'Rectangular': 1,
	'Odd': 2,
};
const byPresetType = (a: BoardPreset, b: BoardPreset): number => {
	if (a.type === b.type) return 0;
	const res = orderOfPresetTypes[a.type] - orderOfPresetTypes[b.type];
	return Math.sign(res);
}
const byPresetNumCells = (a: BoardPreset, b: BoardPreset): number => {
	return Math.sign(a.numCells - b.numCells);
}

export function sortPresetsByTypeAndSize(presets: BoardPreset[]): BoardPreset[] {
	// First by type: Normal, Rect, Odd
	// Then by size: smallest to largest (width x height)
	return [...presets].sort((a, b) => {
		const byTypeRes = byPresetType(a, b);
		if (byTypeRes !== 0) return byTypeRes;
		return byPresetNumCells(a, b);
	})
}