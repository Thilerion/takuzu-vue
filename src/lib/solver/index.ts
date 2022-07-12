export { selectCell, selectValue } from './selection';
export { default as Solver } from './Solver';

import type { SimpleBoard } from '../board/Board';
import Solver from './Solver';

type QuickSolveOptsBT = {
	backtracking: true,
	solutions: number
}
type QuickSolveOptsNoBT = {
	backtracking?: false,
	solutions?: null | 1
}
export type QuickSolveOpts = QuickSolveOptsBT | QuickSolveOptsNoBT;
const defaultQuickSolveOpts: QuickSolveOpts = {
	backtracking: false,
	solutions: 1
} as const;

export type QuickSolveResult = 
	| { solvable: true, results: SimpleBoard[], validPuzzle: boolean | null }
	| { solvable: false, results: never[], validPuzzle: false };
export async function quickSolve(board: SimpleBoard, opts: QuickSolveOpts = defaultQuickSolveOpts): Promise<QuickSolveResult> {
	const backtracking = opts.backtracking ?? false;
	const solutions = opts.solutions ?? 1;
	const solveResults = Solver.run(board, {
		disableBacktracking: !backtracking,
		maxSolutions: solutions,
		timeoutDuration: 2000,
		throwAfterTimeout: false
	});

	const solvable = solveResults.length > 0;
	if (solvable) {
		// can only check for validPuzzle if checking for more solutions and backtracking is enabled
		const validPuzzle = (backtracking && solutions > 1) ? solveResults.length === 1 : null;
		return { solvable: true as const, results: solveResults, validPuzzle };
	} else {
		return { solvable: false as const, results: [], validPuzzle: false as const };
	}
}