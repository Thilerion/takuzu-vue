import type { SimpleBoard } from "../board/Board.js";
import { EMPTY } from "../constants.js";
import { MaskDifficultyValidation } from "./mask-validation.js";

export type CreateMaskOpts = {
	maxAttempts?: number,
	// timeout: number,
}

/**
 * Creates a valid, solvable puzzle board with a unique solution, based on the provided difficulty setting.
 * The puzzle board is created by iteratively removing cells from the solution board, and checking if it has a unique solution.
 * It checks whether a puzzle is a) not too hard given the difficulty settings, and b) not too easy.
 */
export function createMaskWithDifficulty(
	solution: SimpleBoard,
	difficultyValidator: MaskDifficultyValidation,
	opts: CreateMaskOpts = {}
): SimpleBoard | null {
	const {
		maxAttempts = 10,
	} = opts;

	for (let i = 0; i < maxAttempts; i++) {
		// Create a mask that can be uniquely solved
		const mask = createMask(solution, difficultyValidator);

		// Verify that the mask is not too easy
		if (difficultyValidator.verifyMinimumDifficulty(mask)) {
			return mask;
		}
	}
	// console.warn(`Failed to create a mask after ${maxAttempts} attempts.`);
	return null;
}

function createMask(
	solution: SimpleBoard,
	maskValidator: Pick<MaskDifficultyValidation, 'hasUniqueSolution'>
): SimpleBoard {
	const maskedBoard = solution.copy();

	// Shuffle all cells, and set them to EMPTY one by one. If the result is an unsolvable board, undo this.
	// It then continues with the other cells, to ensure a result that has the fewest amount of filled cells, while still being solvable.
	for (const { x, y, value } of maskedBoard.cells({ shuffled: true, skipEmpty: true })) {
		maskedBoard.assign(x, y, EMPTY);
		if (!maskValidator.hasUniqueSolution(maskedBoard)) {
			maskedBoard.assign(x, y, value);
		}
	}
	return maskedBoard;
}