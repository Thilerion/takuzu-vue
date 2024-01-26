// rework of @/lib/strategies/LineBalance.ts => checkLineBalanceStrategy

import { ONE, ZERO, type PuzzleSymbol } from "@/lib/constants.js";
import type { SolverStrategyResult } from "./types.js";
import type { BoardLine } from "@/lib/board/BoardLine.js";

export type TriplesStrategyResult = SolverStrategyResult<{
	value: PuzzleSymbol,
}>;

export const checkLineBalanceStrategy = (boardLine: BoardLine): TriplesStrategyResult => {
	if (boardLine.isFilled) return { found: false } as const;

	const {
		[ONE]: remainingOne,
		[ZERO]: remainingZero
	} = boardLine.countRemaining;

	// split up ifs, because if remainingZero is 0, but remainingOne is not > 0, we don't need to check the second if statement
	if (remainingZero === 0) {
		if (remainingOne > 0) return { found: true, data: { value: ONE }};
	} else if (remainingOne === 0) {
		if (remainingZero > 0) return { found: true, data: { value: ZERO }};
	}
	return { found: false } as const;
}