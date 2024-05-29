import type { BasicPuzzleConfig, BoardAndSolutionBoards } from "../types.js";
import { MaskDifficultyValidation } from "./mask-validation.js";
import { createMaskWithDifficulty } from "./mask.js";
import { getMaskQuality, getOptimalMaskRatio } from "./quality.js";
import { generateSolutionBoard } from "./solution.js";

export interface CreatePuzzleOpts {
	maxAttempts?: number,
	timeout?: number
}
export type CreatePuzzleReturn = BoardAndSolutionBoards & {
	quality: { maskedRatio: number, symbolDistribution: number }
};

export function createPuzzle(
	{ width, height, difficulty }: BasicPuzzleConfig,
	opts: CreatePuzzleOpts = {}
): CreatePuzzleReturn | null {
	const {
		maxAttempts = 40,
		timeout = 5000,
	} = opts;

	// Setup timeout and attempts
	const { hasTimedOut } = createTimeoutHandler(timeout);
	let attemptsLeft = maxAttempts;

	// Setup required data
	const difficultyValidator = MaskDifficultyValidation.fromPuzzleConfig({ width, height, difficulty });
	const optimalMaskedRatio = getOptimalMaskRatio(width, height, difficulty);

	// Attempt to create a valid puzzle within the specified time and attempts.
	while (!hasTimedOut() && attemptsLeft > 0) {
		attemptsLeft -= 1;

		const solution = generateSolutionBoard(width, height, 5);
		if (!solution) {
			// console.warn('Attempt to create solution failed in "createPuzzle".');
			continue;
		}

		const mask = createMaskWithDifficulty(
			solution,
			difficultyValidator,
			{ maxAttempts: 20 }
		);

		if (!mask) {
			// console.warn('Attempt to create mask failed in "createPuzzle".');
			continue;
		}

		const qualityResult = getMaskQuality(mask, optimalMaskedRatio);
		const { maskedRatio, symbolDistribution } = qualityResult;

		if (maskedRatio < 0.95 || symbolDistribution < 0.35) {
			// console.warn('Quality check failed in "createPuzzle".');
			continue;
		}

		return {
			solution,
			board: mask,
			quality: qualityResult
		}
	}

	if (attemptsLeft <= 0) {
		console.warn('Max attempts reached in "createPuzzle" without a valid result.');
	} else if (hasTimedOut()) {
		console.warn('Timeout reached in "createPuzzle" without a valid result.');
	} else {
		console.warn('Could not create a valid puzzle in "createPuzzle", with an unknown reason.');
	}
	return null;
}

function createTimeoutHandler(timeout: number) {
	const start = performance.now();
	const end = start + timeout;

	const hasTimedOut = () => performance.now() >= end;
	const timeLeft = () => end - performance.now();
	return {
		hasTimedOut,
		timeLeft
	};
}