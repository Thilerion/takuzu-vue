import { SimpleBoard } from "@/lib";
import { EMPTY, ONE, ZERO } from "@/lib/constants";
import { ConstraintSolver } from "@/lib/solvers/constraint-solver/ConstraintSolver.js";
import type { BoardShape, PuzzleGrid, PuzzleValueLine } from "@/lib/types.js";
import { useDebounceFn } from "@vueuse/core";
import { computed, reactive, ref, toRefs, watch, type Ref } from "vue";
import type { PuzzleInputGrid } from "./types.js";
import { arrayCountValues } from "@/utils/array.ts.utils.js";

const MAX_MASK_RATIO = 0.9;

export const usePuzzleInputSolvable = (gridRef: Ref<PuzzleInputGrid | null>, isValidGridRef: Ref<boolean>, dimensionsRef: Ref<BoardShape>) => {
	const maxSolutions = ref(200);
	const isValidGrid = (gridRef: Ref<PuzzleInputGrid | null>): gridRef is Ref<PuzzleInputGrid> => !!isValidGridRef.value;

	const numCells = computed(() => (dimensionsRef.value.width ?? 0) * (dimensionsRef.value.height ?? 0));

	const parsedGrid = computed((): PuzzleGrid => {
		if (!isValidGrid(gridRef)) return [];
		const grid: PuzzleGrid = [];
		for (const gridRow of gridRef.value) {
			const row: PuzzleValueLine = [];
			for (const value of gridRow) {
				if (value === ONE || value === ZERO) {
					row.push(value);
				} else {
					row.push(EMPTY);
				}
			}
			grid.push(row);
		}
		return grid;
	})

	const numEmpty = computed(() => {
		if (!isValidGridRef.value) return null;
		return arrayCountValues(parsedGrid.value.flat(), EMPTY);
	})

	const maskRatio = computed(() => {
		if (!isValidGridRef.value) return null;
		return numEmpty.value! / numCells.value;
	})

	const shouldRunSolver = computed(() => {
		return isValidGridRef.value && maskRatio.value! < MAX_MASK_RATIO;
	})

	const data = reactive({
		solutions: 0 as null | number,
		solvable: false,
		validPuzzle: false,
		validInput: shouldRunSolver,
		maskRatio,
	})

	const runSolver = useDebounceFn(async (grid) => {
		const board = new SimpleBoard(grid);
		// TODO: quickSolve in worker
		const solveResult = await ConstraintSolver.findAmountOfSolutions(
			board,
			{ 
				maxSolutions: maxSolutions.value
			}
		);
		const { numSolutions: solutions, solvable } = solveResult;
		const validPuzzle = solutions === 1;
		Object.assign(data, { solvable, validPuzzle, solutions });
	}, 300, { maxWait: 2000 });

	watch([shouldRunSolver, parsedGrid], ([shouldRun, grid]) => {
		if (!shouldRun) {			
			data.solutions = null;
			data.solvable = false;
			data.validPuzzle = false;
			return;
		}
		runSolver(grid);
	}, { deep: true, immediate: true })

	return {
		...toRefs(data),
		maxSolutions
	}
}