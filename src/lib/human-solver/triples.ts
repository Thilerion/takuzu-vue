import { checkTriplesStrategy } from "../solvers/common/TriplesStrategy.js";
import type { Target, Vec } from "../types";
import type { HumanTechniqueBoardOnly } from "./types";

type DoubleVec = readonly [Vec, Vec];
export type TriplesTechniqueResult = {
	technique: 'triples',
	type: 'sandwich' | 'double',
	targets: Target[],
	origin: DoubleVec
}
export function humanSolveTriples({ board }: HumanTechniqueBoardOnly) {
	const results: TriplesTechniqueResult[] = [];

	for (const threesUnit of board.threesUnits()) {
		
		const result = checkTriplesStrategy(threesUnit);

		if (!result.found) continue;
		const { target, type, origin } = result.data;

		// combine all results with same origin; a double has two target cells
		const equalResult = results.find(prevResult => {
			if (prevResult.type === 'sandwich') return false;
			if (prevResult.targets.length > 1) return false;
			const { origin: prevOrigin } = prevResult;

			return isOriginEqual(origin, prevOrigin);
		})

		if (equalResult != null) {
			equalResult.targets.push(target);
		} else {
			results.push({
				technique: 'triples',
				targets: [target],
				type,
				origin
			});
		}
	}

	return results;
}
function isOriginEqual(a: DoubleVec, b: DoubleVec) {
	const [a1, a2] = a;
	const [b1, b2] = b;

	return areCoordsEqual(a1, b1) && areCoordsEqual(a2, b2);
}

function areCoordsEqual(coordsA: Vec, coordsB: Vec) {
	return coordsA.x === coordsB.x && coordsA.y === coordsB.y;
}