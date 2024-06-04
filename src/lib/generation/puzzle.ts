import { clamp } from "@/utils/number.utils.js";
import type { BasicPuzzleConfig, BoardAndSolutionBoards, BoardShape } from "../types.js";
import { MaskDifficultyValidation, type CreateMaskValidatorsOpts } from "./mask-validation.js";
import { createMaskWithDifficulty } from "./mask.js";
import { getMaskQualityChecker, type MaskQualityResult } from "./quality.js";
import { generateSolutionBoard } from "./solution.js";

export interface CreatePuzzleOpts {
	maxAttempts?: number,
	timeout?: number
}
export type CreatePuzzleReturn = BoardAndSolutionBoards & {
	quality: MaskQualityResult
};

function createPuzzle(
	{ width, height }: BoardShape,
	difficultyValidator: MaskDifficultyValidation,
	opts: CreatePuzzleOpts = {}
): CreatePuzzleReturn | null {
	const {
		maxAttempts = 40,
		// Should prefer using maxAttempts for limiting, and use the timeout value primarily to avoid the extremely long edge cases.
		timeout = 5000,
	} = opts;

	// Setup timeout and attempts
	const { hasTimedOut, getTimeLeft } = createTimeoutHandler(timeout);
	let attemptsLeft = maxAttempts;

	// Setup required data
	const checkMaskQuality = getMaskQualityChecker({ width, height });

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

		// Set strictness of quality check based on the amount of attempts left, where all attempts left means 1, and no attempts left means 0.
		const easedStrictness = getAttemptQualityStrictness(maxAttempts, attemptsLeft, getTimeLeft());

		const qualityResult = checkMaskQuality(mask, { strictness: easedStrictness });
		if (!qualityResult.success) {
			// console.warn('Quality check failed in "createPuzzle".');
			continue;
		}		
		// console.log(`Quality check passed after ${currentAttempt + 1} attempts for a ${width}x${height} puzzle, with a maskRatio of ${qualityResult.maskRatio}.`)

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

export function createPuzzleWithCustomDifficulty(
	{ width, height }: BoardShape,
	difficultyConfig: CreateMaskValidatorsOpts | MaskDifficultyValidation,
	opts?: CreatePuzzleOpts
): CreatePuzzleReturn | null {
	let difficultyValidator: MaskDifficultyValidation;
	if (difficultyConfig instanceof MaskDifficultyValidation) {
		difficultyValidator = difficultyConfig;
	} else {
		difficultyValidator = new MaskDifficultyValidation({ width, height }, difficultyConfig);
	}
	return createPuzzle({ width, height }, difficultyValidator, opts);
}

export function createPuzzleWithPuzzleConfig(
	puzzleConfig: BasicPuzzleConfig,
	opts: CreatePuzzleOpts = {}
): CreatePuzzleReturn | null {
	const difficultyConfig = MaskDifficultyValidation.fromPuzzleConfig(puzzleConfig);
	const { width, height } = puzzleConfig;
	return createPuzzle({ width, height }, difficultyConfig, opts);
}

function createTimeoutHandler(timeout: number) {
	const start = performance.now();
	const end = start + timeout;

	const hasTimedOut = () => performance.now() >= end;
	const getTimeLeft = () => end - performance.now();
	return {
		hasTimedOut,
		getTimeLeft
	};
}

export function getAttemptQualityStrictness(
	maxAttempts: number,
	attemptsLeft: number,
	timeLeft: number,
): number {
	// If only little time left after the mask generation, don't bother with strictness
	if (timeLeft < 200) {
		return 0;
	}

	const currentAttempt = maxAttempts - attemptsLeft - 1;

	// Always start at strictness = 1, even when maxAttempts = 1,
	if (currentAttempt <= 0) return 1;

	// Cap maxAttempts to 10, and any attempt beyond that will have the same strictness as the 10th attempt (0)
	if (maxAttempts > 10 && currentAttempt >= 10) {
		return 0;
	}

	const cappedAttempt = Math.min(currentAttempt, 10);
	const cappedMaxAttempts = Math.min(maxAttempts, 10);
	// Otherwise, set strictness to a value between 0 and 1 based on the number of attempts left
	return clamp(0, 1 - (cappedAttempt / cappedMaxAttempts), 1);			
}