import { ZERO, ONE } from "@/lib/constants.js";
import type { SolverSelectValueFn } from "../types.js";
import { countLineValues } from "@/lib/utils.js";

export const zeroFirstValue: SolverSelectValueFn = () => ZERO;
export const randomValue: SolverSelectValueFn = () => Math.random() < 0.5 ? ONE : ZERO;

/* 
Select value that is used the least among the cells' peers (least constraining value in CSP).
Greatly decreases search time while generating, or for boards that need a lot of backtracking in general; less useful for boards that require less backtracking, but not really detrimental.
Using LCV; the algorithm is more likely to go along a correct path, and the fewest returns in the search are required
*/
export const leastConstrainingValue: SolverSelectValueFn = (board, x, y) => {
	const row = board.getRow(y);
	const col = board.getColumn(x);

	const rowCount = countLineValues(row);
	const colCount = countLineValues(col);

	if (rowCount[ONE] + colCount[ONE] < rowCount[ZERO] + colCount[ZERO]) {
		return ONE;
	} else {
		return ZERO;
	}
}