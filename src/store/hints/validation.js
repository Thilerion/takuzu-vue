import { EMPTY } from "@/lib/constants";
import hintTypes from "./hint-types";

export const hintValidators = {
	[hintTypes.MISTAKE]: (hint, { board, solution }) => {
		for (let { x, y } of hint.targets) {
			const boardValue = board.get(x, y);
			const solutionValue = solution.get(x, y);
			if (boardValue !== solutionValue) return true;
		}
		return false;
	},
	[hintTypes.TRIPLES]: (hint, { board, solution }) => {
		for (const target of hint.targets) {
			const { x, y } = target;
			if (board.get(x, y) !== EMPTY) return false;
		}
		return true;
	}
}