import { EMPTY } from "@/lib/constants";
import hintTypes from "./hint-types";


// TODO: before all hintValidators (except mistake), validate there are no mistakes first!
export const hintValidators = {
	[hintTypes.MISTAKE]: (hint, { board, solution }) => {
		for (let { x, y } of hint.targets) {
			const boardValue = board.get(x, y);
			const solutionValue = solution.get(x, y);
			if (boardValue !== solutionValue && boardValue !== EMPTY) return true;
		}
		return false;
	},
	[hintTypes.TRIPLES]: (hint, { board, solution }) => {
		for (const target of hint.targets) {
			const { x, y } = target;
			if (board.get(x, y) !== EMPTY) return false;
		}
		const sourceCells = hint.source.map(({ x, y }) => {
			return board.get(x, y);
		});
		if (sourceCells[0] !== sourceCells[1] || sourceCells[0] === EMPTY) {
			// both source cells should still have the same value
			return false;
		}
		return true;
	},
	[hintTypes.BALANCE]: (hint, { board, solution }) => {
		// const anyStillEmpty = hint.targets.some(({ x, y }) => {
		// 	return board.get(x, y) === EMPTY;
		// });
		// console.log({ anyStillEmpty });
		// if (!anyStillEmpty) return false;
		// const othersTargetValue = hint.targets.every(({ x, y, value }) => {
		// 	return [EMPTY, value].includes(board.get(x, y));
		// })
		// console.log({ othersTargetValue });
		// if (!othersTargetValue) return false;
		// TODO: make sure all other values in the line are still the same
		// TODO: make sure there are no mistakes
		console.warn('Balance hint validation TO DO');
		return false;
	},
	[hintTypes.ELIMINATION]: (hint, { board, solution }) => {
		console.warn('Elimination hint validation TO DO');
		return false;
	},
	[hintTypes.ELIM_DUPE]: (hint, { board, solution }) => {
		console.warn('Elimination-Duplicate hint validation TO DO');
		return false;
	}
}