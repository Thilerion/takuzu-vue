import { SimpleBoard } from "@/lib";
import { EMPTY, ONE, ZERO } from "@/lib/constants";
import { quickSolve } from "@/lib/solver";
import { count } from "@/lib/utils";
import { useDebounceFn } from "@vueuse/core";
import { computed, reactive, ref, toRefs, watch } from "vue";

const MAX_MASK_RATIO = 0.9;

export const usePuzzleInputSolvable = (gridRef, isValidGridRef, dimensionsRef) => {
	const maxSolutions = ref(200);

	const numCells = computed(() => (dimensionsRef.value.width ?? 0) * (dimensionsRef.value.height ?? 0));

	const parsedGrid = computed(() => {
		if (!isValidGridRef.value) return [];
		const grid = [];
		for (const gridRow of gridRef.value) {
			const row = [];
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
		return count(parsedGrid.value.flat(), EMPTY);
	})

	const maskRatio = computed(() => {
		if (!isValidGridRef.value) return null;
		return numEmpty.value / numCells.value;
	})

	const shouldRunSolver = computed(() => {
		return isValidGridRef.value && maskRatio.value < MAX_MASK_RATIO;
	})

	const data = reactive({
		solutions: 0,
		solvable: false,
		validPuzzle: false,
		validInput: shouldRunSolver,
		maskRatio,
	})

	const runSolver = useDebounceFn(async (grid) => {
		const board = new SimpleBoard(grid);
		const {
			solvable, validPuzzle, results: solutionsArray
		} = await quickSolve(board, { backtracking: true, solutions: maxSolutions.value });
		const numSolutions = solutionsArray.length;
		Object.assign(data, { solvable, validPuzzle, solutions: numSolutions });
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