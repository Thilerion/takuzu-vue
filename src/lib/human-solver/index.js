import { humanSolveBalance } from "./balance.js";
import { humanSolveElimination } from "./elimination.js";
import { humanSolveTriples } from "./triples.js";

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

export function findAllAvailableMoves({ board, solution }) {
	const availableMoves = techniqueList.flatMap(techniqueFn => {
		return techniqueFn({ board, solution });
	})
	console.log({ availableMoves });
	return availableMoves;
}