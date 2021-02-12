import { humanSolveBalance } from "./balance";
import { humanSolveElimination } from "./elimination";
import { humanSolveTriples } from "./triples";

const techniqueList = [
	humanSolveTriples,
	humanSolveBalance,
	({ board, solution }) => humanSolveElimination({ board, solution }, { least: [1, 1], enforceUniqueLines: false }),
	// ({ board, solution }) => humanSolveElimination({ board, solution }, { least: [1, 1], enforceUniqueLines: true }),
	({ board, solution }) => humanSolveElimination({ board, solution }, { least: [2, 2], enforceUniqueLines: false }),
	// ({ board, solution }) => humanSolveElimination({ board, solution }, { least: [2, 2], enforceUniqueLines: true }),
	({ board, solution }) => humanSolveElimination({ board, solution }, { least: [3, 10], enforceUniqueLines: false }),
	// ({ board, solution }) => humanSolveElimination({ board, solution }, { least: [3, 10], enforceUniqueLines: true }),
]

export function findAllAvailableMoves({ board, solution }, options = {}) {
	const availableMoves = techniqueList.flatMap(techniqueFn => {
		return techniqueFn({ board, solution });
	})
	console.log({ availableMoves });
	return availableMoves;
}