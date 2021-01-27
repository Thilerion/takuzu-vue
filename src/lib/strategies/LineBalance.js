import { ONE, ZERO } from "../constants";

export function checkLineBalanceStrategy(boardLine) {
	if (boardLine.isFilled) return { found: false };

	const remainingOne = boardLine.getValueRemaining(ONE);
	const remainingZero = boardLine.getValueRemaining(ZERO);

	if (remainingZero === 0 && remainingOne > 0) {
		return { found: true, value: ONE };
	}
	if (remainingOne === 0 && remainingZero > 0) {
		return { found: true, value: ZERO };
	}
	return { found: false };
}