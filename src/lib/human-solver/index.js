import { humanSolveBalance } from "./balance";
import { humanSolveTriples } from "./triples";

const techniqueList = [
	humanSolveTriples,
	humanSolveBalance
]

export function findAllAvailableMoves({ board, solution }, options = {}) {
	const availableMoves = techniqueList.flatMap(techniqueFn => {
		return techniqueFn({ board, solution });
	})
	console.log({ availableMoves });
	return availableMoves;
}