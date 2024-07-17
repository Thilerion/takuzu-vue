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
	// Reverse presets to get currentPresets, to allowing taking the last item inside the loop
	let currentPresets = [...presets].reverse();
	const successes: IPregenPuzzle[] = []; // Save the generated puzzles here

	const successfulPresetKeys: PuzzleConfigKey[] = [];

	while (attemptsLeft > 0 && currentPresets.length > 0) {
		attemptsLeft -= 1;
		while (currentPresets.length) {
			if (lazy) {
				// prevent fans blowing etc when first opening the page
				await awaitTimeout(250);
			}
			// Take the last item from the "currentPresets" array. So if we want to preserve the ordering of the input presets array, this needs to have been reversed
			const cur = currentPresets.pop()!;
			const result = await genPuzzleFn(cur.config);
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