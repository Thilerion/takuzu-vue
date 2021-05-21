import { EMPTY } from "@/lib/constants";

const puzzleHistoryModule = {
	namespaced: true,

	state: () => ({
		moveList: [],
	}),

	getters: {
		lastMove: state => state.moveList.length > 0 ? state.moveList[state.moveList.length - 1] : null,
	},

	mutations: {
		reset: state => state.moveList = [],

		editLastMove: (state, move) => state.moveList.splice(-1, 1, move),
		popLastMove: state => state.moveList.pop(),
		addMove: (state, move) => state.moveList.push(move),
	},

	actions: {
		addMove({ getters, commit }, { x, y, value, nextValue }) {
			if (value == null) value = EMPTY;

			const lastMove = getters.lastMove;
			
			if (moveIsSameCell(lastMove, x, y)) {
				if (moveShouldBePopped(lastMove, nextValue)) {
					// cell is toggled back to original state
					commit('popLastMove');
					return;
				} else {
					// edit move
					const newMove = combineMove(lastMove, nextValue);
					commit('editLastMove', newMove);
					return;
				}
			} else {
				// push new move
				const newMove = new PuzzleMove(x, y, nextValue, value);
				commit('addMove', newMove);
				return;
			}
		}
	}

}

const PuzzleMove = (x, y, value, prevValue) => ({ x, y, value, prevValue });

function moveIsSameCell(prevMove, x, y) {
	return prevMove && prevMove.x === x && prevMove.y === y;
}
function moveShouldBePopped(prevMove, value) {
	return prevMove && prevMove.prevValue === value;
}
function combineMove(prevMove, value) {
	const { x, y, prevValue } = prevMove;
	return new PuzzleMove(x, y, value, prevValue);
}

export default puzzleHistoryModule;