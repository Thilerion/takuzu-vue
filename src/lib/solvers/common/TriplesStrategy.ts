// rework of @/lib/strategies/Triples.ts => checkTriplesStrategy
// Experimented with loops, with joining to strings and comparing to '11.' and '.11', etc, but this is the fastest

import type { ThreesUnit } from "@/lib/board/ThreesUnit.js";
import { EMPTY } from "@/lib/constants.js";
import type { SolverStrategyResult } from "./types.js";
import type { Target, Vec } from "@/lib/types.js";
import { getOppositeSymbol } from "@/lib/utils.js";

export type TriplesStrategyResult = SolverStrategyResult<{
	type: 'sandwich' | 'double',
	target: Target,
	origin: readonly [Vec, Vec]
}>;

export const checkTriplesStrategy = (unit: Pick<ThreesUnit, 'values' | 'coords'>): SolverStrategyResult<{
	type: 'sandwich' | 'double',
	target: Target,
	origin: readonly [Vec, Vec]
}> => {
	const { values, coords } = unit;
	const [vA, vB, vC] = values;

	// check for 'double' strategy
	// 11., 00.
	if (vA === vB && vA !== EMPTY && vC === EMPTY) {
		const { x, y } = coords[2];
		return {
			found: true,
			data: {
				type: 'double' as const,
				target: {
					value: getOppositeSymbol(vA),
					x, y
				},
				origin: [coords[0], coords[1]]
			}
		};
	}
	// .11, .00
	if (vB === vC && vB !== EMPTY && vA === EMPTY) {
		const { x, y } = coords[0];
		return {
			found: true,
			data: {
				type: 'double' as const,
				target: {
					value: getOppositeSymbol(vB),
					x, y
				},
				origin: [coords[1], coords[2]]
			}

		}
	}

	// Check for 'sandwich' strategy
	// 1.1, 0.0
	if (vA === vC && vA !== EMPTY && vB === EMPTY) {
		const { x, y } = coords[1];
		return {
			found: true,
			data: {
				type: 'sandwich' as const,
				target: {
					value: getOppositeSymbol(vA),
					x, y
				},
				origin: [coords[0], coords[2]]
			}

		}
	}

	return { found: false } as const;
}