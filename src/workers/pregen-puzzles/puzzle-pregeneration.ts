import { getAllPresetSizeDifficultyCombinations } from "@/config.js";
import { parsePuzzleConfigKey, toPuzzleConfigKey } from "@/lib/helpers/puzzle-config.js";
import type { BasicPuzzleConfig, DifficultyKey, PuzzleConfigKey } from "@/lib/types.js";
import { puzzleDb } from "@/services/db/puzzles-db/init.js";
import type { IPregenPuzzle } from "@/services/db/puzzles-db/models.js";
import { awaitTimeout } from "@/utils/delay.utils.js";

/*
Step 1: Get all currently stored puzzles, then count how many are stored per preset config
Step 2: Get a list of all wanted preset configs, and the amount of wanted puzzles for each
Step 3: Compare both to find how many are missing; how many to generate per preset config
Step 4: "Expand" the missing presets Map to an array, by duplicating the key for each wanted by the amount wanted
Step 5: Iterate over the list once, and generate the puzzles. If any fail, add them to a "failed" list
Step 6: Iterate over this "failed" list again, up to a maximum, and retry those.
*/

export type PuzzleConfigCountMap = Map<PuzzleConfigKey, number>;
export type PresetConfig = {
    key: PuzzleConfigKey;
    width: number;
    height: number;
    difficulty: DifficultyKey;
    numCells: number;
};
export type PregeneratePuzzlesOpts = {
	lazy: boolean,
	maxDifficulty: DifficultyKey,
	puzzlesPerPreset: number,
	maxRetries: number
}

export async function pregeneratePuzzlesV2(
	genPuzzleFn: (conf: BasicPuzzleConfig) => Promise<IPregenPuzzle | null>,
	opts: Partial<PregeneratePuzzlesOpts> = {}
): Promise<{
    results: IPregenPuzzle[];
    successes: PuzzleConfigKey[];
    failures: PuzzleConfigKey[];
}> {
	const {
        lazy = true,
        maxDifficulty = 3,
        puzzlesPerPreset = 1,
        maxRetries = 3
    } = opts;

	const missingPresets = await findMissingPresets({
		puzzlesPerPreset,
		maxDifficulty
	});
	const expandedMissingPresets = expandMissingPresets(missingPresets);
	return generateMissingPuzzles(expandedMissingPresets, genPuzzleFn, {
		lazy,
		maxRetries
	});
}

async function findMissingPresets({
	puzzlesPerPreset = 1,
	maxDifficulty = 3
}: { puzzlesPerPreset?: number, maxDifficulty?: DifficultyKey } = {}): Promise<PuzzleConfigCountMap> {
	const stored = await puzzleDb.countByPuzzleConfigs();
	const allWantedPresets = getAllPresetSizeDifficultyCombinations()
		.filter(i => i.difficulty <= maxDifficulty)
		.map(({ width, height, difficulty }) => {
			const key: PuzzleConfigKey = toPuzzleConfigKey({ width, height, difficulty });
			const numCells = width * height;
			return { key, width, height, difficulty, numCells };
		});
	// Create a PuzzleConfigCountMap with all wanted presets, with the count being "puzzlesPerPreset - stored.get(key)"
	const missingPresets: PuzzleConfigCountMap = new Map();
	for (const preset of allWantedPresets) {
		const key = preset.key;
		const count = puzzlesPerPreset - (stored.get(key) ?? 0);
		missingPresets.set(key, count);
	}
	return missingPresets;
}

function expandMissingPresets(missing: Map<PuzzleConfigKey, number>): PresetConfig[] {
    return Array.from(missing).flatMap(([key, count]) => {
        const { width, height, difficulty } = parsePuzzleConfigKey(key);
        return Array(count).fill({
            key,
            width,
            height,
            difficulty: difficulty as DifficultyKey,
            numCells: width * height
        });
    }).sort((a, b) => b.numCells - a.numCells || b.difficulty - a.difficulty);
}

async function generateMissingPuzzles(
	presets: PresetConfig[],
	genPuzzleFn: (conf: BasicPuzzleConfig) => Promise<IPregenPuzzle | null>,
	options: Pick<PregeneratePuzzlesOpts, 'lazy' | 'maxRetries'>
): Promise<{ results: IPregenPuzzle[], successes: PuzzleConfigKey[], failures: PuzzleConfigKey[] }> {
	const {
		lazy,
		maxRetries
	} = options;

	let attemptsLeft = maxRetries;
	let failed: PresetConfig[] = [];
	let currentPresets = [...presets];
	const successes: IPregenPuzzle[] = []; // Save the generated puzzles here

	const successfulPresetKeys: PuzzleConfigKey[] = [];

	while (attemptsLeft > 0 && currentPresets.length > 0) {
		attemptsLeft -= 1;
		while (currentPresets.length) {
			if (lazy) {
				// prevent fans blowing etc when first opening the page
				await awaitTimeout(250);
			}
			const cur = currentPresets.pop()!;
			const result = await genPuzzleFn(cur);
			if (result == null || !result.boardStr) {
				failed.push(cur);
				continue;
			}
			successes.push(result);
			successfulPresetKeys.push(cur.key);
		}
		if (attemptsLeft > 0) {
			// Only if attemptsLeft, so "failures" are included correctly
			currentPresets = [...failed];
			failed = [];
		}
	}

	return {
		results: successes,
		successes: successfulPresetKeys,
		failures: failed.map(f => f.key)
	}
}