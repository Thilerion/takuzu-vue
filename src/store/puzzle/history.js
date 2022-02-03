import { EMPTY } from "@/lib/constants.js";

const puzzleHistoryModule = {
	namespaced: true,

	state: () => ({
		moveList: [],
	}),

	getters: {
		lastMove: state => state.moveList.length > 0 ? state.moveList[state.moveList.length - 1] : null,
		canUndo: state => state.moveList.length > 0,
	},

	mutations: {
		reset: state => state.moveList = [],
		setMoveList: (state, moveList) => state.moveList = moveList,

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
				const newMove = PuzzleMove(x, y, nextValue, value);
				commit('addMove', newMove);
				return;
			}
		},
		undoMove({ getters, commit }) {
			const lastMove = { ...getters.lastMove };
			commit('popLastMove');
			return lastMove;
		},

		exportMoveHistory({ state }) {
			return state.moveList.map(move => moveToString(move));
		},
		importMoveHistory({ commit }, moveStrings = []) {
			commit('reset');
			const moveList = moveStrings.map(moveStr => moveFromString(moveStr));
			commit('setMoveList', moveList);
		}
	}

}

const PuzzleMove = (x, y, value, prevValue) => ({ x, y, value, prevValue });

function moveToString(move) {
	const { x, y, value, prevValue } = move;
	return [x, y, value, prevValue].join(',');
}
function moveFromString(str) {
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

export default puzzleHistoryModule;