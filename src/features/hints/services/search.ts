import type { SimpleBoard } from "@/lib/board/Board.js";
import type { SteppedHint } from "./SteppedHint/types.js";
import { NoHintsFoundSteppedHint } from "./SteppedHint/NoHintsFoundHint.js";
import { findHintWithHumanTechniques } from "./strategy.search.js";
import { findMistakesHint } from "./mistake.search.js";

export function searchForHint(board: SimpleBoard, solution: SimpleBoard): SteppedHint {
	return findMistakesHint(board, solution)
		?? findHintWithHumanTechniques(board)
		?? createNoHintsFoundHint(board, solution);
}

/** Returns a newly created "NoHintsFound" hit, with a random cell to reveal. */
function createNoHintsFoundHint(
	board: SimpleBoard,
	solution: SimpleBoard,
): SteppedHint {
	/* TODO: Find a better way to select a cell to reveal,
 		by finding a move that allows the user to continue solving the longest without
 		having to guess (or creating another NoHintsFoundHint) */

	// Find a random cell to reveal by getting a random empty cell on the board.
	const boardCellsNext = board
		.cells({ shuffled: true, skipFilled: true })
		.next();

	if (boardCellsNext.done) {
		throw new Error('No empty cells found, but no hints found either. This should not be possible.');
	}
	const { x, y } = boardCellsNext.value;
	const value = solution.get(x, y);

	const hint = new NoHintsFoundSteppedHint({ target: { x, y, value }});
	return hint;
}