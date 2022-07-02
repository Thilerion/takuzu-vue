import type { BoardLine } from "../board/BoardLine";
import { ONE, ZERO, type PuzzleSymbol } from "../constants";

type LineBalanceNoResult = { found: false };
type LineBalanceResult = { found: true, value: PuzzleSymbol };

export function checkLineBalanceStrategy(boardLine: BoardLine): LineBalanceNoResult | LineBalanceResult {
	if (boardLine.isFilled) return { found: false } as const;

	const remainingOne = boardLine.getValueRemaining(ONE);
	const remainingZero = boardLine.getValueRemaining(ZERO);

	if (remainingZero === 0 && remainingOne > 0) {
		return { found: true, value: ONE } as const;
	}
	if (remainingOne === 0 && remainingZero > 0) {
		return { found: true, value: ZERO } as const;
	}
	return { found: false } as const;
}