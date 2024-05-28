import { getAllPresetSizeDifficultyCombinations, isDifficultyKey } from "@/config.js";
import { setupWorker } from "../utils/workerSetup.js";
import { puzzleDb } from "@/services/db/puzzles-db/init.js";
import type { BasicPuzzleConfig, DifficultyKey, PuzzleConfigKey } from "@/lib/types.js";
import { awaitTimeout } from "@/utils/delay.utils.js";
import type { GenPuzzleWorkerFns } from "../generate-puzzle/generate.worker";
import { type WorkerInterfaceOpts, WorkerInterface } from "../utils/workerInterface";

const fns = {
	"pregen": pregeneratePuzzles,
	"initialize": pregenOrPopulate,
	clearDb: async () => {
		await puzzleDb.puzzles.clear();
		return true;
	},
	retrieveFromDb: async (conf: BasicPuzzleConfig) => {
		return puzzleDb.getPuzzle(conf);
	}
} as const;

setupWorker(fns);


let _worker: null | Worker = null;
const createWorker = () => {
	_worker = new Worker(new URL('../generate-puzzle/generate.worker.ts', import.meta.url), { type: 'module' });
	return _worker;
}

const createGenPuzzleWorker = (opts: WorkerInterfaceOpts = {}): WorkerInterface<GenPuzzleWorkerFns> => {
	const mergedOpts: WorkerInterfaceOpts = {
		autoStart: true,
		startOnInitialization: false,
		...opts,
	}
	return new WorkerInterface<GenPuzzleWorkerFns>(createWorker, mergedOpts);
}
const puzzleWorker = createGenPuzzleWorker();


const presets = getAllPresetSizeDifficultyCombinations()
	.map(({ width, height, difficulty }) => {
		const key = `${width}x${height}-${difficulty}`;
		return { key, width, height, difficulty, numCells: width * height };
	});

type FindPresetsWithoutPuzzlesAndGenerateMissingOpts = {
	lazy: boolean,
	verbose: boolean,
	maxDifficulty: DifficultyKey
}

async function findPresetsWithoutPuzzlesAndGenerateMissing({ lazy = true, verbose = true, maxDifficulty = 3 }: Partial<FindPresetsWithoutPuzzlesAndGenerateMissingOpts> = {}) {
	const presetsInDb = await puzzleDb.puzzles
		.orderBy('[width+height+difficulty]')
		.uniqueKeys();
	
	const mappedPresetsInDb = presetsInDb.map((preset) => {
		const [width, height, difficulty] = (preset as any as [number, number, number]);
		if (!isDifficultyKey(difficulty)) throw new Error(`Invalid difficulty key: ${difficulty}`);
		const key: PuzzleConfigKey = `${width}x${height}-${difficulty}`;
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

		const nextPreset = missingPresets.pop()!;

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
		await puzzleDb.addPuzzle({
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

async function generatePuzzleForPreset(preset: BasicPuzzleConfig) {
	console.log(`Requesting puzzle for preset: ${preset.width}x${preset.height}-${preset.difficulty}`);
	const { width, height, difficulty } = preset;
	try {
		const { boardStr, solutionStr } = await puzzleWorker.request('single', { width, height, difficulty })
		return {
			boardStr, solutionStr, width, height, difficulty
		}
	} catch (e) {
		console.warn(`Could not pregenerate puzzle for preset: ${width}x${height}-${difficulty}`);
		console.error(e);
		return null;
	}
}

async function pregeneratePuzzles(): Promise<{ generated: number, done: boolean }> {
	const numGenerated = await findPresetsWithoutPuzzlesAndGenerateMissing({ lazy: true, verbose: false, maxDifficulty: 3 })
	// TODO: fn should return if it is done, and if and how many puzzles failed to generate
	// TODO: pregen could optionally try to generate more than 1 per preset?
	const result = /* await xxx */ { generated: numGenerated, done: true };
	
	return result;
}

async function pregenOrPopulate() {
	const count = await puzzleDb.puzzles.count();
	if (count > 0) {
		// console.log('Starting pregen worker.');
		return pregeneratePuzzles();
	} else {
		console.log('Populating database with initial puzzles.');
		const initialPopulation = await import('@/services/db/puzzles-db/populate.js');
		puzzleDb.populateWith(initialPopulation.default);
		return { done: true as const, generated: initialPopulation.default.length, populated: true as const };
	}
}

export type PregenPuzzlesWorkerFns = typeof fns;
export type PregenPuzzlesResult = { generated: number, done: boolean };