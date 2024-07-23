import { SimpleBoard } from "@/lib/board/Board.js";
import { ConstraintSolver } from "@/lib/solvers/constraint-solver/ConstraintSolver.js";
import type { PuzzleGrid } from "@/lib/types.js";
import { setupWorker } from "@/workers/utils/workerSetup.js";

const fns = {
	quicksolve: runQuickSolve
} as const;
setupWorker(fns);

async function runQuickSolve(grid: PuzzleGrid, maxSolutions: number) {
	const board = new SimpleBoard(grid);
	const res = await ConstraintSolver.findAmountOfSolutions(
		board,
		{ 
			maxSolutions,
			dfs: {
				throwAfterTimeout: true,
				timeout: 10
			}
		}
	);
	const { instance } = res;
	const instanceResults = instance.getResults();
	if (instanceResults.solvable) {
		const {
			numSolutions, solvable,
			partialPreDfsSolution,
			solutions
		} = instanceResults;
		const partialStr = partialPreDfsSolution == null ? null : partialPreDfsSolution.export();
		const solutionsStrs = solutions.map(s => s.export());
		return {
			numSolutions, solvable,
			partialPreDfsSolution: partialStr,
			solutions: solutionsStrs
		}
	} else {
		const {
			numSolutions, solvable,
			finalBoard
		} = instanceResults;
		const finalBoardStr = finalBoard == null ? null : finalBoard.export();
		return {
			numSolutions, solvable,
			solutions: [] as never[],
			finalBoard: finalBoardStr
		}
	}
}

export type QuickSolveWorkerFns = typeof fns;