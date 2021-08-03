import { EMPTY } from "../constants";
import { getMinimumDifficultyConstraints, maskHasNoSolution, maskHasOneSolution } from "./mask-validation";

export function createMask(board, difficulty = 1) {
	const maskedBoard = board.copy();
	
	for (let { x, y, value } of maskedBoard.cells({ shuffled: true, skipEmpty: true })) {
		maskedBoard.assign(x, y, EMPTY);
		if (!maskHasOneSolution(maskedBoard, difficulty)) {
			// undo removing this as it results in an unsolvable board
			maskedBoard.assign(x, y, value);
		}
	}
	return maskedBoard;
}

export function createMaskWithDifficulty(board, difficulty = 1) {
	const maxAttempts = 5;
	let bestMask;
	for (let i = 0; i < maxAttempts; i++) {
		bestMask = createMask(board, difficulty);

		// verify that puzzle is not too easy
		const minDiffConstraints = getMinimumDifficultyConstraints(difficulty, board.width, board.height);
		if (minDiffConstraints == null) return bestMask; // easiest puzzle, cannot be too easy
		if (maskHasNoSolution(bestMask, minDiffConstraints)) {
			return bestMask;
		}
	}
	console.warn('Mask could not be generated with requested difficulty...');
	return null;
}