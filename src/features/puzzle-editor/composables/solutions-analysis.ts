import { SimpleBoard } from "@/lib/board/Board.js";
import { EMPTY, type PuzzleValue } from "@/lib/constants.js";
import { ConstraintSolver, type ConstraintSolverResult } from "@/lib/solvers/constraint-solver/ConstraintSolver.js";
import type { BoardShape, PuzzleGrid, XYKey } from "@/lib/types.js";
import { arrayCountValues } from "@/utils/array.ts.utils.js";
import { array2d } from "@/utils/array2d.utils.js";
import { get, useDebounceFn } from "@vueuse/core";
import { computed, ref, shallowRef, watch, type MaybeRef, type Ref } from "vue";

/** If the mask ratio is below this value, we should run the solver */
const MAX_MASK_RATIO = 0.9;

export const useSolutionsAnalysis = (
	grid: Ref<null | PuzzleGrid>,
	dimensions: Ref<BoardShape>,
	maxSolutions: MaybeRef<number> = 200,
) => {
	const numEmpty = computed(() => {
		if (grid.value == null) return null;
		return arrayCountValues(grid.value.flat(), EMPTY);
	});
	const numCells = computed(() => dimensions.value.width * dimensions.value.height);
	const maskRatio = computed(() => {
		if (numEmpty.value == null) return 1;
		return numEmpty.value / numCells.value;
	});

	const shouldRunSolver = computed(() => {
		if (grid.value == null) return false;
		return grid.value !== null && maskRatio.value < MAX_MASK_RATIO;
	});

	const solveResult = shallowRef<ConstraintSolverResult | null>(null);
	const isRunning = ref(false);

	const runSolver = useDebounceFn(async (grid) => {
		solveResult.value = null;
		if (!shouldRunSolver.value) {
			isRunning.value = false;
			return;
		}

		// TODO: quickSolve in worker
		try {
			isRunning.value = true;
			const board = new SimpleBoard(grid);
			const res = await ConstraintSolver.findAmountOfSolutions(
				board,
				{ 
					maxSolutions: get(maxSolutions),
					dfs: {
						throwAfterTimeout: true
					}
				}
			);
			const { instance } = res;
			const instanceResults = instance.getResults();
			solveResult.value = instanceResults;
		} catch(e) {
			console.error('QuickSolve timed out in solutions analysis.');
			solveResult.value = null;
		} finally {
			isRunning.value = false;
		}
	}, 300, { maxWait: 2000 });

	watch([shouldRunSolver, grid], ([,grid]) => {
		runSolver(grid!);
	}, { deep: true, immediate: true });

	const solutions = computed(() => {
		return solveResult.value?.numSolutions ?? null;
	})
	const solvable = computed(() => {
		return solveResult.value?.solvable ?? false;
	})
	const validPuzzle = computed(() => {
		return solutions.value === 1;
	})

	const singleSolutionFound = computed((): PuzzleGrid | null => {
		if (solveResult.value != null && solveResult.value.solutions.length === 1) {
			return solveResult.value.solutions[0].grid;
		}
		return null;
	})

	/** Returns the solution, computed from each found solution, if the puzzle was partially solved */
	const combinedPartialSolution = computed((): PuzzleGrid | null => {
		if (solveResult.value == null || !solveResult.value.solvable) return null;
		// this is only valid if amount of solutions found is less than maxSolutions
		// TODO: it is als only valid if the solver didn't stop due to a timeout, but there is no way to know right now. But this is temp fixed by making solver throw after timeout
		const numSolutions = solveResult.value.solutions.length;
		const MAX_SOLUTIONS = get(maxSolutions);
		if (numSolutions < 1 || numSolutions >= MAX_SOLUTIONS) return null;
		const partial = computePartialSolution(solveResult.value.solutions);
		return partial;
	})

	const partialPreDfsSolution = computed((): PuzzleGrid | null => {
		if (solveResult.value == null || !solveResult.value.solvable) return null;
		return solveResult.value.partialPreDfsSolution?.grid ?? null;
	})

	/** The known entire solution, or the partial solution, where only certain values are definitely known. */
	const knownSolution = computed(() => {
		// Return the single solution that was found if there is exactly one solution
		if (singleSolutionFound.value != null) return singleSolutionFound.value;

		if (solveResult.value == null) return null;
		if (solutions.value === 0 || solveResult.value?.solutions.length === 0) return null;

		if (combinedPartialSolution.value) return combinedPartialSolution.value; 
		// Return the partial "pre-DFS" solution grid, if there is one
		if (partialPreDfsSolution.value != null) {
			return partialPreDfsSolution.value;
		}
		return null;
	})

	return {
		solutions, solvable, validPuzzle,
		validInput: shouldRunSolver,
		maskRatio,
		// isRunning,
		knownSolution,
		solveResult,
	}
}

/**
 * Compares multiple puzzle grids (solutions) to find which values are the same in all of them.
 * Those values are definitely known, and can be used in the partial solution.
 */
const computePartialSolution = (solutions: SimpleBoard[]): PuzzleGrid | null => {
	if (solutions.length === 0) return null;
	const { width, height } = solutions[0];
	const res: PuzzleGrid = array2d(width, height, EMPTY);
	const cells = new Map<XYKey, PuzzleValue>();
	// for each x,y in every solution: if every cell is the same, add it to res, else set it to EMPTY

	for (const solution of solutions) {
		for (const { x, y, value } of solution.cells()) {
			const key: XYKey = `${x},${y}`;
			const current = cells.has(key) ? cells.get(key)! : null;
			if (current == null || current === value) {
				cells.set(key, value);
			} else {
				cells.set(key, EMPTY);
			}
		}
	}

	for (const [key, value] of cells) {
		const [x, y] = key.split(',').map(Number);
		res[y][x] = value;
	} 
	return res;
}