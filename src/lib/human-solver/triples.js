import { checkTriplesStrategy } from "../strategies/Triples";

export function humanSolveTriples(data, options = {}) {
	const { board } = data;

	const results = [];

	for (const threesUnit of board.threesUnits()) {
		
		const result = checkTriplesStrategy(threesUnit, { detailed: true });

		if (!result.found) continue;

		const { target, type, origin } = result;

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
				targets: [target],
				type,
				origin
			});
		}
	}

	return results;
}

function isOriginEqual(a, b) {
	const [a1, a2] = a;
	const [b1, b2] = b;

	return areCoordsEqual(a1, b1) && areCoordsEqual(a2, b2);
}

function areCoordsEqual(coordsA, coordsB) {
	return coordsA.x === coordsB.x && coordsA.y === coordsB.y;
}