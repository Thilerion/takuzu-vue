import { BoardPreset, isDifficultyKey } from "@/config.js";
import type { BasicPuzzleConfig, BoardShape, DifficultyKey } from "@/lib/types.js";
import { type WeightedArrayItem, pickRandomWeighted, pickRandom } from "@/utils/random.utils.js";
import { getPresetFromBoardShape } from "./board-presets.js";
import { clamp } from "@/utils/number.utils.js";

export type DifficultyRange = [min: DifficultyKey, max: DifficultyKey];
export const isDifficultyRange = (val: unknown): val is DifficultyRange => {
	return Array.isArray(val) && val.length === 2 && val.every(isDifficultyKey);
}

export type PuzzleSetupConfig = {
	size: BoardShape | BoardShape[],
	difficulty: DifficultyKey | DifficultyRange,
	options: {
		pickSizeWithEqualWeights: boolean,
	}
}

/**
 * Convert a PuzzleSetupConfig to a single BasicPuzzleConfig.
 * The difficulty and size can be randomly selected if they are not set as single value.
 * The way these are randomly selected depends on the options.
 */
export function selectPuzzleConfigFromSetupConfig(conf: PuzzleSetupConfig): BasicPuzzleConfig {
	const preset = getPresetFromConfSize(conf.size, conf.options);
	if (Array.isArray(conf.size)) {
		console.log(`Selected preset (${preset.width}x${preset.height}) from config size.`, JSON.parse(JSON.stringify(conf.size)));
	}
	const difficulty = getDifficultyFromConfAndPreset(conf, preset);
	if (Array.isArray(conf.difficulty)) {
		console.log(`Selected difficulty (${difficulty}) from config difficulty.`, JSON.parse(JSON.stringify(conf.difficulty)));
	}
	return { width: preset.width, height: preset.height, difficulty };
}

/** Converts an array of BoardShapes to an array of WeightedArrayItems. */
export function getWeightedBoardShapes(sizes: BoardShape[]): WeightedArrayItem<BoardShape>[] {
	return sizes.map(size => {
		const weight = boardShapeToSelectionWeight(size);
		return [size, weight];
	});
}

/** Converts a BoardShape first to an expected pick frequence, then to a number weight (as integer, between 1 and 100) */
export function boardShapeToSelectionWeight({ width, height }: BoardShape): number {
	const numCells = clamp(36, width * height, 224);

	// All weights are in relation to the weight of a 10x10 board
	const baseValue = Math.pow(100, 1.1);
	const curValue = Math.pow(numCells, 1.1);
	const weight = Math.round((baseValue / curValue) * 100);

	// This results in weights: 6x6=324, 10x10=100, 14x14=48; 6x6 picked 3.2x as 10x10, 6x6 picked 6.75x as 14x14, and 10x10 picked 2.1x as 14x14
	return weight;
}

/**
 * Pick a BoardShape/BoardPreset randomly from a list of BoardShapes.
 * This is weighted by the amount of cells in the BoardShape, if enabled.
 */
export function pickRandomPresetFromBoardShapes(sizes: BoardShape[], opts: { weightByNumCells: boolean }): BoardPreset | null {
	const { weightByNumCells } = opts;
	if (weightByNumCells) {
		const withWeights = getWeightedBoardShapes(sizes);
		const randomSize = pickRandomWeighted(withWeights);
		return getPresetFromBoardShape(randomSize);
	}

	const randomSize = pickRandom(sizes);
	return getPresetFromBoardShape(randomSize);
}

/** 
 * Pick a difficulty (randomly) from a DifficultyRange (as [min, max]) that is valid for a selected BoardPreset.
 */
export function pickRandomDifficultyFromRange(range: DifficultyRange, selectedPreset: BoardPreset): DifficultyKey {
	const presetMaxDifficulty = selectedPreset.maxDifficulty;
	if (range[1] > presetMaxDifficulty && range[0] > presetMaxDifficulty) {
		throw new Error('Selected preset.maxDifficulty is not compatible with the provided DifficultyRange.');
	}
	const maxDifficulty = Math.min(selectedPreset.maxDifficulty, range[1]);
	if (!isDifficultyKey(maxDifficulty)) {
		throw new Error('Math.min with two difficulty keys returned a non-difficulty key.');
	}
	const minDifficulty = range[0];
	if (minDifficulty > maxDifficulty) {
		throw new Error(`Invalid difficulty range for size ${selectedPreset.width}x${selectedPreset.height}: min is higher than max.`);
	}
	const newRange: DifficultyRange = [minDifficulty, maxDifficulty];
	const difficultyList = expandDifficultyRange(newRange);
	return pickRandom(difficultyList);
}

/**
 * From a single BoardShape or a list of BoardShapes, pick a BoardPreset that matches it.
 * If the config has a single BoardShape, it returns the corresponding BoardPreset (or throws an error if it cannot be found).
 * If the config has a list of BoardShapes, it picks a random BoardPreset that matches it. This can be weighted by the amount of cells in the preset, depending on the option.
 */
export function getPresetFromConfSize(size: BoardShape | BoardShape[], opts?: { pickSizeWithEqualWeights: boolean }): BoardPreset {
	if (Array.isArray(size)) {
		const useSizeEqualWeights = opts?.pickSizeWithEqualWeights ?? false;
		const weightByNumCells = !useSizeEqualWeights;
		console.log(`Selecting random preset from config size, with option weightByNumCells: ${weightByNumCells}`);
		const preset = pickRandomPresetFromBoardShapes(size, { weightByNumCells });
		if (preset == null) {
			throw new Error(`No preset found for list of sizes.`);
		}
		return preset;
	} else {
		const preset = getPresetFromBoardShape(size);
		if (preset == null) {
			throw new Error(`No preset found for size ${size.width}x${size.height}`);
		}
		return preset;
	}
}

/**
 * Get the difficulty from the PuzzleSetupConfig and a selected BoardPreset.
 * If the config has a DifficultyRange, picks a random difficulty that is valid for the selected preset.
 * If the config has a single difficulty, checks that it is valid for the selected preset.
 */
export function getDifficultyFromConfAndPreset(conf: Pick<PuzzleSetupConfig, 'difficulty'>, preset: BoardPreset): DifficultyKey {
	if (!isDifficultyRange(conf.difficulty)) {
		const difficulty: DifficultyKey = conf.difficulty;
		if (!preset.isCompatibleWithDifficulty(difficulty)) {
			throw new Error(`Preset ${preset.width}x${preset.height} does not allow difficulty ${difficulty}.`);
		}
		return difficulty;
	} else {
		return pickRandomDifficultyFromRange(conf.difficulty, preset);
	}
}

/** Convert a DifficultyRange (as [min, max]) to an array of DifficultyKeys, with all keys between min and max included. */
export function expandDifficultyRange(range: DifficultyRange): DifficultyKey[] {
	const [min, max] = range;
	if (min === max) return [min];
	const result: DifficultyKey[] = [];
	for (let i = min; i <= max; i++) {
		if (!isDifficultyKey(i)) throw new Error(`Invalid difficulty key: ${i}`);
		result.push(i);
	}
	return result;
}