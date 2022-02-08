export { selectCell, selectValue } from './solver/selection.js';
export { Solver } from './Solver.js';

import { Solver } from './Solver.js';

export async function quickSolve(board, {
	backtracking = false,
	solutions = 1
}) {
	const solutions = Solver.run(board, {
		disableBacktracking: !backtracking,
		maxSolutions: solutions,
		timeoutDuration: 2000,
		throwAfterTimeout: false
	});

	return {
		solvable: solutions.length > 0,
		results: solutions
	}
}