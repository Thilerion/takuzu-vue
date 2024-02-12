import { checkTriplesStrategy } from "../../common/TriplesStrategy";
import type { Target, Vec } from '@/lib/types.js';
import type { ThreesUnit } from "@/lib/board/ThreesUnit";

export type TriplesTechniqueResult = {
	technique: 'triples',
	type: 'sandwich' | 'double',
	targets: Target[],
	origin: readonly [Vec, Vec]
};

export type HumanTriplesTechniqueParams = {
	board: {
		threesUnits: () => Iterable<Pick<ThreesUnit, 'coords' | 'values'>>
	}
}

/**
 * Find targets that can be filled on a board using the triples technique.
 * The starting point is the patterns that a human sees (a double or a sandwich), and the
 * resulting possible targets that can be filled. This is different than the constraint solver,
 * and its use of techniques, which is more about finding which empty cells can be filled.
 */
export function humanTriplesTechnique({ board }: HumanTriplesTechniqueParams): TriplesTechniqueResult[] {
	const results: TriplesTechniqueResult[] = [];

	const threesUnits = board.threesUnits();

	for (const unit of threesUnits) {
		const stratRes = checkTriplesStrategy(unit);
		if (!stratRes.found) continue;

		const { target, type, origin } = stratRes.data;

		if (type === 'double') {
			// if any previous result has the same origin (which can happen with doubles only), combine them. This way, each result has a unique origin, and can have 1 or 2 targets
			const equalResult = results.find(prevResult => {
				if (prevResult.type === 'sandwich') return false;
				const { origin: prevOrigin } = prevResult;
				return isOriginEqual(origin, prevOrigin);
			})
			if (equalResult != null) {
				equalResult.targets.push(target);
				continue;
			}
		}

		results.push({
			technique: 'triples',
			targets: [target],
			type,
			origin
		});
	}

	return results;
}

function isOriginEqual(a: readonly [Vec, Vec], b: readonly [Vec, Vec]) {
	const [a1, a2] = a;
	const [b1, b2] = b;

	return vecEquals(a1, b1) && vecEquals(a2, b2);
}

function vecEquals(coordsA: Vec, coordsB: Vec) {
	return coordsA.x === coordsB.x && coordsA.y === coordsB.y;
}