export { selectCell, selectValue } from './selection';
export { default as Solver } from './Solver';

import Solver from './Solver';

export async function quickSolve(board, {
	backtracking = false,
	solutions = 1
}) {
	const solveResults = Solver.run(board, {
		disableBacktracking: !backtracking,
		maxSolutions: solutions,
		timeoutDuration: 2000,
		throwAfterTimeout: false
	});

	const result = {
		solvable: solveResults.length > 0,
		results: solveResults
	}
	if (solutions > 1 && backtracking) {
		// can only check for validPuzzle if checking for more solutions and backtracking is enabled
		result.validPuzzle = solveResults.length === 1;
	}

	return result;
}