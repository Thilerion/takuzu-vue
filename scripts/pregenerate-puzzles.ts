import { getAllPresetSizeDifficultyCombinations } from "@/config.js";
import { createPuzzleWithPuzzleConfig } from "@/lib/generation/puzzle.js";
import type { BasicPuzzleConfig } from "@/lib/types.js";
import type { IPregenPuzzle } from "@/services/db/puzzles-db/models.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Configuration
const OUTPUT_PATH = '../src/services/db/puzzles-db/pregenerated.json';

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
	const puzzle = createPuzzleWithPuzzleConfig(conf, { maxAttempts: 50, timeout: 5000 });
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