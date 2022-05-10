import { EMPTY } from "@/lib/constants";
import { getMaskValidatorsForPuzzleConfig } from "./mask-validation.js";

export function createMaskWithDifficulty(board, difficulty) {
	const { width, height } = board;
	const { canSolveWith, canNotSolveWith } = getMaskValidatorsForPuzzleConfig({
		width, height, difficulty
	});

	const maxAttempts = 5;
	let bestMask;

	for (let i = 0; i < maxAttempts; i++) {
		bestMask = createMask(board, { canSolveWith, canNotSolveWith });

		// verify puzzle is not too easy
		if (canNotSolveWith == null) {
			return bestMask; // easiest puzzle, cannot be too easy
		}
		if (canNotSolveWith(bestMask)) {
			return bestMask;
		}
	}
	return null;
}

export function createMask(board, { canSolveWith }) {
	const maskedBoard = board.copy();

	for (let { x, y, value } of maskedBoard.cells({ shuffled: true, skipEmpty: true })) {
		maskedBoard.assign(x, y, EMPTY);
		if (!canSolveWith(maskedBoard)) {
			// undo removing this as it results in an unsolvable board
			maskedBoard.assign(x, y, value);
		}
	}
	return maskedBoard;
}