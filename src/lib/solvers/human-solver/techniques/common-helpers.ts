import type { BoardLine } from "@/lib/board/BoardLine.js";

export function assertValidLeastRemaining(value: number | [number, number]): void {
	const left = Array.isArray(value) ? value[0] : value;
	if (left <= 0) {
		throw new Error(`Least remaining lower bound cannot be 0 or lower, but got: ${left}`);
	}
	const right = Array.isArray(value) ? value[1] : value;
	if (right <= 0) {
		throw new Error(`Least remaining upper bound cannot be 0 or lower, but got: ${right}`);
	}
	if (Array.isArray(value) && right < left) {
		throw new Error(`Least remaining upper bound cannot be lower than lower bound, but got: ${right} < ${left}`);
	}
}

export function createLinePredicateWithinLeastRemainingRange(
	leastRemainingRange: [number, number],
	maxEmptyCells: number = Infinity
) {
	const [min, max] = leastRemainingRange;
	return (line: BoardLine): boolean => {
		if (line.isFilled || line.numFilled === 0) return false;
		else if (line.numEmpty > maxEmptyCells) return false;
		const leastRem = line.getLeastRemaining();
		return leastRem >= min && leastRem <= max;
	};
}