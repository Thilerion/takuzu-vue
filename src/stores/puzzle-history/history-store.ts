import type { PuzzleValue } from "@/lib/constants.js";
import type { Vec, VecValueChange } from "@/lib/types.js";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { HistoryMoveSingle, type MoveSingleExport, type HistoryMove, type MoveExport } from "./models.js";

export type PostMoveHistoryAction = "commit" | "commitCombined" | "skip" | "reset";

const moveToString = (move: HistoryMoveSingle): MoveSingleExport => {
	return move.export();
}
const moveFromString = (str: MoveSingleExport) => {
	return HistoryMoveSingle.fromString(str);
}

export const usePuzzleHistoryStore = defineStore('puzzleHistory', () => {
	const moveList = ref([] as HistoryMove[]);

	const lastMove = computed((): HistoryMove | null => {
		return moveList.value.length > 0 ? moveList.value.at(-1)! : null;
	})
	const canUndo = computed(() => lastMove.value != null);
	const reset = (): void => {
		moveList.value = [];
	}
	const undoMove = (): HistoryMove => {
		if (canUndo.value) {
			const lastMove: HistoryMove = moveList.value.pop()!;
			// clone moves to avoid mutation
			return lastMove;
		}
		throw new Error('Cannot undo move; there are no moves to undo.');
	}

	const importMoveHistory = (moveExports: MoveExport[] = []) => {
		reset();
		const importedMoveList: HistoryMove[] = moveExports.map(moveExport => {
			if (Array.isArray(moveExport)) {
				return moveExport.map(moveFromString);
			}
			return moveFromString(moveExport);
		})
		moveList.value = importedMoveList;
	}

	const addMove = ({ x, y, value, nextValue }: Vec & { value: PuzzleValue, nextValue: PuzzleValue }) => {
		const prev = lastMove.value;

		// TODO: add timestamps, and don't combine moves if time difference is higher than a second or so
		if (prev && !Array.isArray(prev) && prev.sameCell({ x, y })) {
			const combined = prev.withNextValue(nextValue);
			if (!combined.hasValueChange()) {
				// cell is back to original state
				moveList.value.pop();
				return;
			} else {
				moveList.value.splice(-1, 1, combined);
				return;
			}
		} else {
			const move = new HistoryMoveSingle(x, y, nextValue, value);
			moveList.value.push(move);
			return;
		}
	}
	const addMultipleMoves = (actions: (Vec & { value: PuzzleValue, nextValue: PuzzleValue })[]) => {
		const moves = actions.map(action => new HistoryMoveSingle(action.x, action.y, action.nextValue, action.value));
		moveList.value.push(moves);
	}

	const applyHistoryAction = (moveOrMoves: VecValueChange[], action: PostMoveHistoryAction) => {
		switch(action) {
			case 'commit': {
				const moves = Array.isArray(moveOrMoves) ? moveOrMoves : [moveOrMoves];
				for (const { x, y, value, prevValue } of moves) {
					addMove({
						x, y, value: prevValue, nextValue: value
					})
				}
				return;
			}
			case 'commitCombined': {
				addMultipleMoves((moveOrMoves as VecValueChange[]).map(m => {
					const { x, y, value, prevValue } = m;
					return { x, y, value: prevValue, nextValue: value };
				}))
				return;
			}
			case 'reset': {
				// make sure that the history is reset to this point, so that the user cannot undo past this point
				reset();
				return;
			}
			case 'skip': {
				// do nothing
				return;
			}
			default: {
				const x: never = action;
				throw new Error(`Unrecognized historyAction type post-makeMove: ${x}`);
			}
		}
	}

	return {
		moveList,
		canUndo,
		
		reset,
		applyHistoryAction,
		undoMove,
		importMoveHistory,
	}
})

// Extracted from store itself to prevent it from continuously showing up in Pinia devtools
const exportMoveHistory = (): MoveExport[] => {
	const store = usePuzzleHistoryStore();
	return store.moveList.map(m => {
		if (Array.isArray(m)) {
			return m.map(moveToString);
		}
		return moveToString(m);
	});
}
export const exportMoveList = () => {
	return exportMoveHistory();
}