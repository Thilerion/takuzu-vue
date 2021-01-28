import { EMPTY } from "../constants";
import Solver from "../solver/Solver";

const solverConf = {
	maxSolutions: 2,
	timeoutDuration: 1000,
	throwAfterTimeout: false,
	disableBacktracking: true
};

export function createBasicMask(board, solverConfig = solverConf) {
	const maskedBoard = board.copy();
	const cellsIterator = maskedBoard.cells({ shuffled: true, skipEmpty: true });

	for (const { x, y, value } of cellsIterator) {
		maskedBoard.assign(x, y, EMPTY);
		if (!maskHasOneSolution(maskedBoard, solverConfig)) {
			maskedBoard.assign(x, y, value);
		}
	}
	return maskedBoard;
}

export function maskHasOneSolution(board, solverConfig) {
	if (solverConfig.maxSolutions !== 2) {
		console.warn('HasOneSolution must always search for 2 solutions!');
		solverConfig.maxSolutions = 2;
	}

	const solutions = Solver.run(board, solverConfig);
	return solutions && solutions.length === 1;
}