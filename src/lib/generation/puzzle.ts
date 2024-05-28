import type { SimpleBoard } from "../board/Board.js";
import { generateSolutionBoard } from "./solution.js";
import type { BasicPuzzleConfig, BoardAndSolutionBoards } from "../types";
import { getOptimalMaskRatio, getMaskQuality } from "./quality.js";
import { createMaskWithDifficulty } from "./mask.js";
import { MaskDifficultyValidation } from "./mask-validation.js";

const minMaskedRatioQuality = 0.94;
const minSymbolDistributionQuality = 0.36;

interface CreatePuzzleOpts {
	maxTries?: number,
	totalMaxDuration?: number,
	tryDurations?: number[]
}
export function createPuzzle(
	puzzleConfig: BasicPuzzleConfig,
	opts: CreatePuzzleOpts = {}
): (BoardAndSolutionBoards & { quality: null | ReturnType<typeof getMaskQuality> }) | undefined {
	const { width, height, difficulty } = puzzleConfig;
	const {
		maxTries = 20,
		totalMaxDuration = 5000,
		tryDurations = [250, 1000, 1750, 2000]
	} = opts;

	const start = performance.now();
	const end = start + totalMaxDuration;
	const shouldEnd = () => performance.now() >= end;

	const optimalMaskedRatio = getOptimalMaskRatio(width, height, difficulty);
	const difficultyValidator = MaskDifficultyValidation.fromPuzzleConfig(puzzleConfig);

	for (let i = 0; i < maxTries; i++) {
		if (shouldEnd()) break;
		let maxTime = 3000;
		if (i < tryDurations.length) {
			maxTime = tryDurations[i];
		}
		const genResult = createBoardAndMaskOnce(
			{ optimalMaskedRatio, width, height, difficulty },
			difficultyValidator,
			maxTime
		);
		const { success } = genResult;


		if (success) {
			const { solution, board, quality } = genResult;
			return { solution, board, quality };
		}
	}
	console.warn('Timeout reached generating puzzle.');
	return;
}

interface CreateBoardAndMaskOnceOpts extends BasicPuzzleConfig {
	optimalMaskedRatio: number
}
type CreateBoardAndMaskOnceReturns =
	| { error: string, success: false }
	| ({ success: true, quality: null | ReturnType<typeof getMaskQuality>} & BoardAndSolutionBoards);

/**
 * Create a complete puzzle, consisting of a solution (filled board) and a puzzle (masked) board.
 * The masked board is created according to the difficulty setting selected.
 * Additionally, the quality of the masked board is evaluated, including the distribution of symbols and the ratio of masked cells.
 */
function createBoardAndMaskOnce(
	opts: CreateBoardAndMaskOnceOpts,
	difficultyValidator: MaskDifficultyValidation,
	maxTime = 1000
): CreateBoardAndMaskOnceReturns  {
	const { width, height, optimalMaskedRatio } = opts;
	const start = performance.now();
	const timeoutAfter = start + maxTime;

	const timeoutReached = () => performance.now() > timeoutAfter;

	let datasolution: null | SimpleBoard = null;
	let databoard: null | SimpleBoard = null;
	let dataquality: null | ReturnType<typeof getMaskQuality> = null;

	while (!datasolution && !timeoutReached()) {
		// const result = generateBoard(width, height);
		const result = generateSolutionBoard(width, height, 5);
		if (result) datasolution = result;
	}

	if (!datasolution) {
		return { error: 'Solution generation timeout reached.', success: false as const };
	}

	while (!databoard && !timeoutReached()) {
		const maskResult = createMaskWithDifficulty(datasolution, difficultyValidator, {});

		if (!maskResult) continue;

		const quality = getMaskQuality(maskResult, optimalMaskedRatio);
		if (maskResult && quality.maskedRatio >= minMaskedRatioQuality && quality.symbolDistribution >= minSymbolDistributionQuality) {
			databoard = maskResult;
			dataquality = quality;
		} else if (maskResult) {
			// console.warn('Generated mask quality was not good enough.');
			// console.log({ board: maskResult, quality, minMaskedRatioQuality, minSymbolDistributionQuality });
		}
	}

	if (!databoard) {
		return { error: 'Mask/board generation timeout reached. Maybe retry with another solutionBoard.', success: false } as const;
	} else {
		return { board: databoard, solution: datasolution, quality: dataquality, success: true as const };
	}
}