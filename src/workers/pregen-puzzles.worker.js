import { getAllPresetSizeDifficultyCombinations } from "@/config";
import { addPuzzle, puzzleDb } from "@/services/puzzles-db/db";
import { awaitTimeout } from "@/utils/delay.utils";

import GeneratePuzzleWorker from './generate-puzzle.worker.js?worker';
import { createWorkerResult } from "./WorkerResult.js";
const puzzleWorker = new GeneratePuzzleWorker();

const createPregenMessage = createWorkerResult('pregen-puzzles');

export function sendWorkerMessage(message) {
	puzzleWorker.postMessage({ message });
}
export function initPuzzleWorkerReceiver() {
	return new Promise((resolve, reject) => {
		puzzleWorker.onmessage = event => {
			const { data } = event;
			if (!data.success) reject(data);
			else resolve(data);
		}
	})
}

const presets = getAllPresetSizeDifficultyCombinations()
	.map(({ width, height, difficulty }) => {
		const key = `${width}x${height}-${difficulty}`;
		return { key, width, height, difficulty, numCells: width * height };
	});

async function findPresetsWithoutPuzzles({ lazy = true, verbose = true, maxDifficulty = 3 } = {}) {
	const presetsInDb = await puzzleDb.puzzles
		.orderBy('[width+height+difficulty]')
		.uniqueKeys();
	
	const mappedPresetsInDb = presetsInDb.map(([width, height, difficulty]) => {
		const key = `${width}x${height}-${difficulty}`;
		return { key, width, height, difficulty };
	});
	
	const missingPresets = presets.filter(({ key, difficulty }) => {
		return difficulty <= maxDifficulty && mappedPresetsInDb.every(presetInDb => {
			return presetInDb.key !== key;
		})
	}).sort((a, b) => {
		if (a.numCells !== b.numCells) {
			return b.numCells - a.numCells;
		}
		return b.difficulty - a.difficulty;
	});

	
	if (!missingPresets.length) return 0;
	
	const failedGenerationPresets = new Map();
	const presetsLength = missingPresets.length;
	const maxTries = presetsLength * 6;
	let i = 0;
	let numGenerated = 0;
	let numFailures = 0;

	while (missingPresets.length) {
		if (i >= maxTries) {
			console.error(`Reached maxAttempts while pregenerating puzzles! "${numGenerated}" succesfully generated puzzles, and ${numFailures} total failures, with ${failedGenerationPresets.size} presets that could not be generated.`);
			break;
		}

		i += 1;

		const nextPreset = missingPresets.pop();

		if (lazy && i > 1) {
			// prevent fans blowing etc when first opening the page
			// higher value for larger boards, because the wait cannot be implemented for the inner createPuzzle function, which will run at full-speed. This tries to mitigate that.
			const waitMs = Math.floor(200 + nextPreset.numCells * 2);
			await awaitTimeout(waitMs);
		}

		const result = await generatePuzzleForPreset(nextPreset);


		if (result == null || !result.boardStr) {
			missingPresets.unshift(nextPreset);
			const presetKey = nextPreset.key;
			const currentFailures = failedGenerationPresets.get(presetKey) ?? 0;
			failedGenerationPresets.set(presetKey, currentFailures + 1);
			numFailures += 1;

			if (verbose) {
				console.warn(`[PREGEN FAILURE]: Failed generating puzzle for preset "${presetKey}"`);
			}

			continue;
		}

		if (verbose) {
			console.log(`[PREGEN SUCCESS]: Generated puzzle for preset ${nextPreset.key}`, { result: {...result} });
		}

		const { boardStr, solutionStr, width, height, difficulty } = result;
		numGenerated += 1;
		await addPuzzle({
			boardStr, solutionStr, width, height, difficulty
		});
	}

	if (verbose) {
		console.log(`Generated ${numGenerated}/${presetsLength} puzzles, with ${numFailures} failures, in ${i} attempts`);
		if (failedGenerationPresets.size) {
			console.log('Attempts that failed were for the following presets:');
			console.log({ ...Object.fromEntries(failedGenerationPresets)})
		}
	}

	return numGenerated;
}

export async function generatePuzzleForPreset(preset) {
	const { width, height, difficulty } = preset;
	try {
		const resultPromise = initPuzzleWorkerReceiver();
		sendWorkerMessage({ width, height, difficulty });
		const data = await resultPromise;

		if (!data.success) throw new Error(data.error);

		const { boardStr, solutionStr } = data.value;
		return {
			boardStr, solutionStr, width, height, difficulty
		}
	} catch (e) {
		console.warn(`Could not pregenerate puzzle for preset: ${width}x${height}-${difficulty}`);
		console.error(e);
		return null;
	}
}

async function initPuzzlePregen(opts = {}) {
	
	try {
		const result = await findPresetsWithoutPuzzles(opts);
		postMessage(createPregenMessage(true, result));
	} catch (e) {
		console.error(e);
		postMessage(createPregenMessage(false, e?.message ?? e));
	}
}

addEventListener('message', event => {
	const { task } = event.data.message;
	
	if (task === 'pregen') {
		// get list of puzzles (size+diff combis) that need to be generated

		initPuzzlePregen({
			lazy: true
		});
	} else {
		console.warn('Could not recognize task for PregenPuzzle worker.');
		console.warn(event.data);
		postMessage(createPregenMessage(false, `Unrecognized task: "${task}"`));
	}
})