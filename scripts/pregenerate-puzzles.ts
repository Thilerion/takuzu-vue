import { getAllPresetSizeDifficultyCombinations } from "@/config.js";
import { createPuzzleWithPuzzleConfig } from "@/lib/generation/puzzle.js";
import type { BasicPuzzleConfig } from "@/lib/types.js";
import type { IPregenPuzzle } from "@/services/db/puzzles-db/models.js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";


// Configuration
const OUTPUT_PATH = '../src/services/db/puzzles-db/pregenerated.json';
// Parse arguments
const MAX_ATTEMPTS_ARG = process.argv.find(arg => arg.startsWith('--max-attempts=')) ?? '=50';
const MAX_ATTEMPTS = parseInt(MAX_ATTEMPTS_ARG.split('=')[1]);
if (Number.isNaN(MAX_ATTEMPTS)) {
	throw new Error('Max attempts must be a number.');
} else if (MAX_ATTEMPTS < 5) {
	throw new Error('Max attempts needs to be at least 5.');
}

const ATTEMPT_TIMEOUT_ARG = process.argv.find(arg => arg.startsWith('--attempt-timeout=')) ?? '=5000';
const ATTEMPT_TIMEOUT = parseInt(ATTEMPT_TIMEOUT_ARG.split('=')[1]);
if (Number.isNaN(ATTEMPT_TIMEOUT)) {
	throw new Error('Attempt timeout must be a number.');
} else if (ATTEMPT_TIMEOUT < 1000 || ATTEMPT_TIMEOUT > 30_000) {
	throw new Error('Attempt timeout must be between 1000 and 30,000.');
}

const createProgressTracker = (requested: number) => {
	let progressRatio = 0;
	let current = 0;

	const logProgress = () => {
		const p = `${Math.round(progressRatio * 100)}%`;
		const outOf = `${current}/${requested}`;
		process.stdout.write(`\rProgress: ${p} \t(${outOf})\r`);
	}
	const updateProgress = (value: number) => {
		current = value;
		const newProgress = current / requested;
		if (newProgress > progressRatio) {
			progressRatio = newProgress;
			logProgress();
		}
	}

	return { updateProgress, logProgress };
}

// Function to create a single pre-generated puzzle
function createPregenPuzzle(conf: BasicPuzzleConfig, puzzles: IPregenPuzzle[]): boolean {
	const puzzle = createPuzzleWithPuzzleConfig(conf, { maxAttempts: MAX_ATTEMPTS, timeout: ATTEMPT_TIMEOUT });
	if (!puzzle) return false;

	const { board, solution } = puzzle;
	const pregenPuzzle = {
		boardStr: board.export(),
		solutionStr: solution.export(),
		...conf
	};
	puzzles.push(pregenPuzzle);
	return true;
}

// Save puzzles to file
function savePuzzlesToFile(puzzles: IPregenPuzzle[], outputPath: string) {
	const fullPath = fileURLToPath(new URL(outputPath, import.meta.url));
	const outputDir = dirname(fullPath);
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}
	writeFileSync(fullPath, JSON.stringify(puzzles, null, 2), "utf-8");
	console.log(`Puzzle data saved to ${fullPath}\n`);
}

const presets = getAllPresetSizeDifficultyCombinations();
const presetsWithRequestAmount = presets.map(p => {
	let amount = 1;
	if (p.difficulty <= 2) amount = 5;
	else if (p.difficulty <= 3) amount = 2;

	return { preset: p, amount }
});
const totalRequested = presetsWithRequestAmount.reduce((acc, p) => acc + p.amount, 0);
const puzzles: IPregenPuzzle[] = [];
const { updateProgress, logProgress } = createProgressTracker(totalRequested);
logProgress();

for (const obj of presetsWithRequestAmount) {
	const { preset, amount: requested } = obj;
	let amountSuccess = 0;
	for (let i = 0; i < 10; i++) {
		const success = createPregenPuzzle(preset, puzzles);
		updateProgress(puzzles.length);
		if (success) amountSuccess++;
		if (amountSuccess >= requested) break;
	}
}

console.log('\n\nFinished!\n');
savePuzzlesToFile(puzzles, OUTPUT_PATH);