import { EMPTY } from "@/lib/constants.js";
import { defineStore } from "pinia";

export const usePuzzleHistoryStore = defineStore('puzzleHistory', {

	state: () => ({
		moveList: []
	}),

	getters: {
		lastMove: state => state.moveList.length > 0 ? state.moveList[state.moveList.length - 1] : null,
		canUndo: state => state.moveList.length > 0
	},
	
	actions: {
		reset() {
			this.$reset();
		},
		popLastMove() {
			return this.moveList.pop();
		},
		editLastMove(move) {
			this.moveList.splice(-1, 1, move);
		},
		addMove({ x, y, value = EMPTY, nextValue }) {
			const lastMove = this.lastMove;

			// TODO: add timestamps, and don't combine moves if time difference is higher than a second or so
			if (moveIsSameCell(lastMove, x, y)) {
				if (moveShouldBePopped(lastMove, nextValue)) {
					// cell is back to original state
					this.popLastMove();
					return;
				} else {
					const newMove = combineMove(lastMove, nextValue);
					return this.editLastMove(newMove);
				}
			} else {
				const newMove = PuzzleMove(x, y, nextValue, value);
				this.moveList.push(newMove);
			}
		},
		undoMove() {
			const lastMove = { ...this.popLastMove() };
			return lastMove;
		},

		importMoveHistory(moveStrings = []) {
			this.reset();
			const moveList = moveStrings.map(moveFromString);
			this.moveList = moveList;
		}
	}

})


const PuzzleMove = (x, y, value, prevValue) => ({ x, y, value, prevValue });

export function moveToString(move) {
	const { x, y, value, prevValue } = move;
	return [x, y, value, prevValue].join(',');
}
export function moveFromString(str) {
	const data = str.split(',');
	const x = parseInt(data[0]);
	const y = parseInt(data[1]);
	const value = data[2];
	const prevValue = data[3];
	return PuzzleMove(x, y, value, prevValue);
}

function moveIsSameCell(prevMove, x, y) {
	return prevMove && prevMove.x === x && prevMove.y === y;
}
function moveShouldBePopped(prevMove, value) {
	return prevMove && prevMove.prevValue === value;
}
function combineMove(prevMove, value) {
	const { x, y, prevValue } = prevMove;
	return PuzzleMove(x, y, value, prevValue);
}