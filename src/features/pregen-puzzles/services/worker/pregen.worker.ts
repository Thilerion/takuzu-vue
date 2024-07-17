import { setupWorker } from "@/workers/utils/workerSetup.js";
import type { BasicPuzzleConfig } from "@/lib/types.js";
import type { GenPuzzleWorkerFns } from "@/workers/generate-puzzle/generate.worker";
import { type WorkerInterfaceOpts, WorkerInterface } from "@/workers/utils/workerInterface.js";
import { getPregenPresetsToGenerate } from "@/features/pregen-puzzles/services/pregenerator/presets.js";
import { generateMissingPuzzles } from "@/features/pregen-puzzles/services/pregenerator/pregenerate.js";
import { getPuzzleDb } from "@/features/pregen-puzzles/services/db/db.js";
import type { IPregenPuzzle } from "@/features/pregen-puzzles/services/db/models.js";
import { PUZZLE_GENERATOR_VERSION } from "@/constants.js";

const fns = {
	"pregen": pregeneratePuzzles,
	"initialize": pregenOrPopulate,
	clearDb: async () => {
		await getPuzzleDb().puzzles.clear();
		return true;
	},
	retrieveFromDb: async (conf: BasicPuzzleConfig) => {
		return getPuzzleDb().takePuzzle(conf);
	}
} as const;

setupWorker(fns);


let _worker: null | Worker = null;
const createWorker = () => {
	_worker = new Worker(new URL('../../../../workers/generate-puzzle/generate.worker.ts', import.meta.url), { type: 'module' });
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

async function findPresetsWithoutPuzzlesAndGenerateMissing(): Promise<number> {
	const toGenerate = await getPregenPresetsToGenerate();
	const {
		results, successes, failures
	} = await generateMissingPuzzles(toGenerate, generatePuzzleForPreset, {
		lazy: true,
		maxRetries: 3
	});

	if (results.length) {
		await getPuzzleDb().addPuzzles(results);
	}
	console.log(`[PREGEN] Successfully generated ${successes.length} puzzles, and failed to generate ${failures.length} puzzles.`);
	if (failures.length) {
		console.warn(`[PREGEN] Failed to generate the following puzzle configs:`);
		console.warn(failures);
	}
	return successes.length;
}

async function generatePuzzleForPreset(preset: BasicPuzzleConfig): Promise<IPregenPuzzle | null> {
	console.log(`Requesting puzzle for preset: ${preset.width}x${preset.height}-${preset.difficulty}`);
	const { width, height, difficulty } = preset;
	try {
		const { boardStr, solutionStr } = await puzzleWorker.request('single', { width, height, difficulty })
		return {
			boardStr, solutionStr, width, height, difficulty
		}
	} catch (e) {
		console.warn(`Could not pregenerate puzzle for preset: ${width}x${height}-${difficulty}`);
		console.warn(e);
		return null;
	}
}

async function pregeneratePuzzles(): Promise<{ generated: number, done: boolean }> {
	const numGenerated = await findPresetsWithoutPuzzlesAndGenerateMissing()
	// TODO: fn should return if it is done, and if and how many puzzles failed to generate
	// TODO: pregen could optionally try to generate more than 1 per preset?
	const result = /* await xxx */ { generated: numGenerated, done: true };
	
	return result;
}

async function pregenOrPopulate() {
	const count = await getPuzzleDb().puzzles.count();
	if (!count) {
		console.log('Populating database with initial puzzles.');
		const initialPopulation = await import('@/features/pregen-puzzles/services/db/populate.js');
		const { generatorVersion, pregeneratedPuzzles } = initialPopulation.default;
		// TODO: validate that the current generatorVersion is the same as what was used to generate the pregenerated puzzles
		if (generatorVersion >= PUZZLE_GENERATOR_VERSION) {
			getPuzzleDb().populateWith(pregeneratedPuzzles);
			return { done: true as const, generated: pregeneratedPuzzles.length, populated: true as const };
		}

		console.warn(`[PREGEN] Warning: generatorVersion (${generatorVersion}) does not match current version (${PUZZLE_GENERATOR_VERSION}). Cannot use these puzzles to pre-populate the database.`);
	}
	return pregeneratePuzzles();
}

export type PregenPuzzlesWorkerFns = typeof fns;
export type PregenPuzzlesResult = { generated: number, done: boolean };