import { getAllPresetSizeDifficultyCombinations } from "@/config.js";
import { addPuzzle, puzzleTable } from "@/services/puzzles-db/db.js";

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
		return { key, width, height, difficulty };
	});

async function findPresetsWithoutPuzzles() {
	const presetsInDb = await puzzleTable
		.orderBy('[width+height+difficulty]')
		.uniqueKeys();
	
	const mappedPresetsInDb = presetsInDb.map(([width, height, difficulty]) => {
		const key = `${width}x${height}-${difficulty}`;
		return { key, width, height, difficulty };
	});
	
	const missingPresets = presets.filter(({ key }) => {
		return mappedPresetsInDb.every(presetInDb => {
			return presetInDb.key !== key;
		})
	});
	
	if (!missingPresets.length) return 0;

	const maxTries = missingPresets.length * 6;
	let i = 0;
	let numGenerated = 0;
	while (missingPresets.length) {
		if (i >= maxTries) break;
		i++;

		const nextPresetIdx = Math.floor(Math.random() * missingPresets.length);
		const nextPreset = missingPresets[nextPresetIdx];
		const { width, height, difficulty } = nextPreset;

		try {
			const receivedDataPromise = initPuzzleWorkerReceiver();
			sendWorkerMessage({ width, height, difficulty });
			const data = await receivedDataPromise;
			if (!data.success) throw new Error(data.error);

			const {
				boardStr, solutionStr
			} = data.value;

			await addPuzzle({ boardStr, solutionStr, width, height, difficulty });
			numGenerated += 1;
			missingPresets.splice(nextPresetIdx, 1);
			console.log('generated puzzle:', { width, height, difficulty });
		} catch (e) {
			console.log('Could not pregen this preset', e);
		}
	}

	return numGenerated;
}

async function initPuzzlePregen() {
	
	try {
		const result = await findPresetsWithoutPuzzles();
		postMessage(createPregenMessage(true, result));
	} catch (e) {
		postMessage(createPregenMessage(false, e?.message ?? e));
	}
}

addEventListener('message', event => {
	const { task } = event.data.message;
	
	if (task === 'pregen') {
		// get list of puzzles (size+diff combis) that need to be generated

		initPuzzlePregen();
	} else {
		console.warn('Could not recognize task for PregenPuzzle worker.');
		console.warn(event.data);
		postMessage(createPregenMessage(false, `Unrecognized task: "${task}"`));
	}
})