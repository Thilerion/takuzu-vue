import type { PuzzleValue } from "@/lib/constants.js";
import type { Vec } from "@/lib/types.js";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { HistoryMoveSingle, type MoveSingleExport, type HistoryMove, type MoveExport } from "./models.js";

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
	const canUndo = computed(() => moveList.value.length > 0);
	const reset = (): void => {
		moveList.value = [];
	}
	const undoMove = () => {
		if (canUndo.value) {
			const lastMove: HistoryMove = moveList.value.pop()!;
			// clone moves to avoid mutation
			return {...lastMove};
		}
		throw new Error('Cannot undo move; there are no moves to undo.');
	}

	const importMoveHistory = (moveExports: MoveExport[] = []) => {
		reset();
		const importedMoveList: HistoryMove[] = moveExports.map(moveExport => {
			return moveFromString(moveExport);
		})
		moveList.value = importedMoveList;
	}

	const addMove = ({ x, y, value, nextValue }: Vec & { value: PuzzleValue, nextValue: PuzzleValue }) => {
		const prev = lastMove.value;

		// TODO: add timestamps, and don't combine moves if time difference is higher than a second or so
		if (prev && prev.sameCell({ x, y })) {
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
		}

	}

	const exportMoveHistory = (): MoveExport[] => {
		return moveList.value.map(m => {
			return moveToString(m);
		});
	}

	return {
		lastMove,
		canUndo,
		
		reset,
		addMove,
		undoMove,
		importMoveHistory,
		exportMoveHistory,
	}
})

export const exportMoveList = () => {
	const store = usePuzzleHistoryStore();
	return store.exportMoveHistory();
}