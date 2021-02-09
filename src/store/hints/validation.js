import hintTypes from "./hint-types";

export const hintValidators = {
	[hintTypes.MISTAKE]: (hint, { board, solution }) => {
		for (let { x, y } of hint.targets) {
			const boardValue = board.get(x, y);
			const solutionValue = solution.get(x, y);
			if (boardValue !== solutionValue) return true;
		}
		return false;
	}
}