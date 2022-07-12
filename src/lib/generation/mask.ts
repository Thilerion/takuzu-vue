import { EMPTY } from "@/lib/constants";
import type { SimpleBoard } from "../board/Board.js";
import type { DifficultyKey } from "../types.js";
import { getMaskValidatorsForPuzzleConfig } from "./mask-validation.js";

type SolveCheckerFn = (maskedBoard: SimpleBoard) => boolean;

export function createMaskWithDifficulty(board: SimpleBoard, difficulty: DifficultyKey) {
	const { width, height } = board;
	const { canSolveWith, canNotSolveWith } = getMaskValidatorsForPuzzleConfig({
		width, height, difficulty
	});

	const maxAttempts = 5;
	let bestMask;

	for (let i = 0; i < maxAttempts; i++) {
		bestMask = createMask(board, { canSolveWith });

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

export function createMask(board: SimpleBoard, { canSolveWith }: { canSolveWith: SolveCheckerFn }) {
	const maskedBoard = board.copy();

	for (const { x, y, value } of maskedBoard.cells({ shuffled: true, skipEmpty: true })) {
		maskedBoard.assign(x, y, EMPTY);
		if (!canSolveWith(maskedBoard)) {
			// undo removing this as it results in an unsolvable board
			maskedBoard.assign(x, y, value);
		}
	}
	return maskedBoard;
}