import type { PuzzleConfigKey } from "@/lib/types.js";
import type { GeneratePuzzleFn } from "../types.js";
import type { PregenPresetConfig } from "./presets.js";
import type { IPregenPuzzle } from "@/services/db/puzzles-db/models.js";
import { awaitTimeout } from "@/utils/delay.utils.js";

export type GenerateMissingPuzzlesOpts = {
	lazy: boolean,
	maxRetries: number
}

export async function generateMissingPuzzles(
	presets: PregenPresetConfig[],
	genPuzzleFn: GeneratePuzzleFn,
	options: GenerateMissingPuzzlesOpts
): Promise<{ results: IPregenPuzzle[], successes: PuzzleConfigKey[], failures: PuzzleConfigKey[] }> {
	const {
		lazy,
		maxRetries
	} = options;

	let attemptsLeft = maxRetries;
	let failed: PregenPresetConfig[] = [];
	let currentPresets = [...presets];
	const successes: IPregenPuzzle[] = []; // Save the generated puzzles here

	const successfulPresetKeys: PuzzleConfigKey[] = [];

	while (attemptsLeft > 0 && currentPresets.length > 0) {
		attemptsLeft -= 1;
		
		try {
			const runResult = await generateMissingPuzzlesSingleRun(
				currentPresets,
				genPuzzleFn,
				{ sleep: lazy ? 250 : null }
			);
			successes.push(...runResult.results);
			successfulPresetKeys.push(...runResult.successes);
			failed = [...failed, ...runResult.failures];
		} catch(e) {
			console.warn('Error while pre-generating puzzles:', e);
			console.warn(`There are ${attemptsLeft} attempts left, and ${currentPresets.length} presets left to generate.`);
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

/** Does a single run through the presets to generate, and returns the generated puzzles, their presets, and any failed presets. */
async function generateMissingPuzzlesSingleRun(
	presets: PregenPresetConfig[],
	genPuzzleFn: GeneratePuzzleFn,
	options: { sleep: null | number}
): Promise<{
	results: IPregenPuzzle[],
	successes: PuzzleConfigKey[],
	failures: PregenPresetConfig[]
}> {
	const { sleep } = options;
	const lazy = sleep != null;

	const failed: PregenPresetConfig[] = [];
	const successes: IPregenPuzzle[] = []; // Save the generated puzzles here
	const successfulPresetKeys: PuzzleConfigKey[] = [];

	let genPuzzleErrors = 0;

	for (let i = 0; i < presets.length; i++) {
		if (lazy) {
			// prevent fans blowing etc when first opening the page
			await awaitTimeout(250);
		}
		// Take the last item from the "currentPresets" array. So if we want to preserve the ordering of the input presets array, this needs to have been reversed
		const cur = presets[i];
		const result = await genPuzzleFn(cur.config).catch(() => {
			genPuzzleErrors += 1;
			return null;
		});
		
		if (result == null || !result.boardStr) {
			failed.push(cur);
			continue;
		}
		successes.push(result);
		successfulPresetKeys.push(cur.key);

		if (genPuzzleErrors >= 3) {
			throw new Error(`Generate puzzle function threw 3 errors. Something is wrong.`);
		}
	}

	return {
		results: successes,
		successes: successfulPresetKeys,
		failures: failed
	}
}