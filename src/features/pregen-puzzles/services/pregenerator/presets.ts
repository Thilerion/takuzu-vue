import { dimensionsToBoardType, getAllPresetSizeDifficultyCombinations, type BoardType } from "@/config.js";
import { toPuzzleConfigKey } from "@/lib/helpers/puzzle-config.js";
import type { PuzzleConfigKey, DifficultyKey, BasicPuzzleConfig } from "@/lib/types.js";
import { puzzleDb } from "@/services/db/puzzles-db/init.js";
import { ArrayComparator, compareByOrder, compareNumeric } from "@/utils/orderBy.utils.js";

export type PuzzleConfigCountMap = Map<PuzzleConfigKey, number>;
export type PregenPresetConfig = {
    key: PuzzleConfigKey;
	config: BasicPuzzleConfig;
};
export type WantedPregenPreset = PregenPresetConfig & {
	wanted: number,
};
export type MissingPregenPresetCount = PregenPresetConfig & {
	missing: number
};
export type WantedPregenPresetOptions = {
	maxDifficulty?: DifficultyKey,
	puzzlesPerPreset?: number
}
export type GetPregenPresetsToGenerateConfig = WantedPregenPresetOptions | {
	presets: WantedPregenPreset[]
}

export async function getPregenPresetsToGenerate(
	config: GetPregenPresetsToGenerateConfig = {},
): Promise<PregenPresetConfig[]> {
	let wanted: WantedPregenPreset[];
	if ('presets' in config) {
		wanted = config.presets;
	} else {
		wanted = getDefaultWantedPresetConfigs(config);
	}
	const available = await getCurrentlyAvailablePresetConfigCounts();
	const missing = getMissingPresetConfigCounts(wanted, available);
	return expandMissingPresetConfigCounts(missing);
}

/** Get the default presets that we want to keep stocked in the database. */
export function getDefaultWantedPresetConfigs(
	{ maxDifficulty = 3, puzzlesPerPreset = 1 }: { maxDifficulty?: DifficultyKey, puzzlesPerPreset?: number } = {}
): WantedPregenPreset[] {
	const combinations = getAllPresetSizeDifficultyCombinations();
	return combinations.filter(i => i.difficulty <= maxDifficulty).map(conf => {
		const key = toPuzzleConfigKey(conf);
		return { key, config: { ...conf }, wanted: puzzlesPerPreset };
	})
}

export async function getCurrentlyAvailablePresetConfigCounts(): Promise<PuzzleConfigCountMap> {
	return await puzzleDb.countByPuzzleConfigs();
}

const MissingPresetSortComparator = ArrayComparator
	// First, sort by difficulty: easiest first
	.orderBy<MissingPregenPresetCount>(compareNumeric((item) => item.config.difficulty))
	// Else, sort by puzzles with most missing: most first
	.thenBy('-missing')
	// Else, sort by puzzle type: Square>Rect>Odd
	.thenBy(compareByOrder(
		(item) => dimensionsToBoardType(item.config.width, item.config.height),
		(['Normal', 'Rectangular', 'Odd'] satisfies BoardType[])
	))
	// Else, sort by numCells (width * height): smallest first
	.thenBy(compareNumeric((item) => item.config.width * item.config.height));
function sortMissingPresetConfigCounts(
	data: MissingPregenPresetCount[]
): MissingPregenPresetCount[] {
	return MissingPresetSortComparator.sort(data);
}

export function getMissingPresetConfigCounts(
	wanted: WantedPregenPreset[],
	available: PuzzleConfigCountMap
): MissingPregenPresetCount[] {
	const result: MissingPregenPresetCount[] = [];

	for (const wantedPreset of wanted) {
		const { key, wanted: wantedCount, config } = wantedPreset;
		const availableCount = available.get(key) ?? 0;
		const missingCount = wantedCount - availableCount;
		if (missingCount > 0) {
			result.push({ key, config, missing: missingCount });
		}
	}
	return sortMissingPresetConfigCounts([...result]);
}

export function expandMissingPresetConfigCounts(
	missingCounts: MissingPregenPresetCount[],
): PregenPresetConfig[] {
	return missingCounts.flatMap(({ key, config, missing }) => {
		const expanded: PregenPresetConfig[] = [];
		for (let i = 0; i < missing; i++) {
			expanded.push({ key, config: { ...config } });
		}
		return expanded;
	})
}