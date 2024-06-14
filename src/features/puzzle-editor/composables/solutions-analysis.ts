import { SimpleBoard } from "@/lib/board/Board.js";
import { EMPTY } from "@/lib/constants.js";
import { ConstraintSolver } from "@/lib/solvers/constraint-solver/ConstraintSolver.js";
import type { BoardShape, PuzzleGrid } from "@/lib/types.js";
import { arrayCountValues } from "@/utils/array.ts.utils.js";
import { get, useDebounceFn } from "@vueuse/core";
import { computed, reactive, ref, toRefs, watch, type MaybeRef, type Ref } from "vue";

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

	const results = reactive({
		solutions: null as null | number,
		solvable: false,
		validPuzzle: false,
	})
	const foundSingleSolution = ref(null as null | PuzzleGrid);
	const isRunning = ref(false);

	const runSolver = useDebounceFn(async (grid) => {
		const board = new SimpleBoard(grid);
		// TODO: quickSolve in worker
		const solveResult = await ConstraintSolver.findAmountOfSolutions(
			board,
			{ 
				maxSolutions: get(maxSolutions)
			}
		);
		const { numSolutions: solutions, solvable, instance } = solveResult;
		const validPuzzle = solutions === 1;
		let singleSolution: null | PuzzleGrid = null;
		if (solutions === 1) {
			const board = instance.getResults().solutions[0];
			const grid = board.grid;
			singleSolution = grid;
		}
		Object.assign(results,{
			solvable, validPuzzle, solutions
		});
		foundSingleSolution.value = singleSolution;
		isRunning.value = false;
	}, 300, { maxWait: 2000 });

	watch([() => results.validPuzzle, grid], ([hasSingleSolution, grid], [,prevGrid]) => {
		if (!hasSingleSolution || grid == null || grid !== prevGrid) {
			foundSingleSolution.value = null;
		}
	}, { immediate: true });

	watch([shouldRunSolver, grid], ([shouldRun, grid]) => {
		if (!shouldRun) {
			Object.assign(results, {
				solutions: null as null | number,
				solvable: false,
				validPuzzle: false,
			})
			return;
		}
		isRunning.value = true;
		runSolver(grid!);
	}, { deep: true, immediate: true })

	return {
		...toRefs(results),
		validInput: shouldRunSolver,
		maskRatio,
		isRunning,
		singleSolution: foundSingleSolution,
	}
}