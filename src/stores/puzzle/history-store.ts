import type { PuzzleValue } from "@/lib/constants.js";
import type { Vec } from "@/lib/types.js";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export class HistoryMoveSingle {
	x: number;
	y: number;
	value: PuzzleValue;
	prevValue: PuzzleValue;
	type = 'single' as const;

	constructor(x: number, y: number, value: PuzzleValue, prevValue: PuzzleValue) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.prevValue = prevValue;
	}

	sameCell(other: Vec) {
		return this.x === other.x && this.y === other.y;
	}
	withNextValue(nextValue: PuzzleValue) {
		// combines with a different value, while keeping the same initial value. Useful when cell is toggled, then toggled again.
		return new HistoryMoveSingle(this.x, this.y, nextValue, this.prevValue);
	}
	hasValueChange() {
		return this.value !== this.prevValue;
	}

	isOriginalValueWithChange(value: PuzzleValue) {
		return this.prevValue === value;
	}

	export(): MoveSingleExport {
		return `${this.x},${this.y},${this.value},${this.prevValue}`;
	}
	static fromString(str: MoveSingleExport) {
		const split = str.split(',');
		const x = parseInt(split[0]);
		const y = parseInt(split[1]);
		const value = split[2] as PuzzleValue;
		const prevValue = split[3] as PuzzleValue;
		return new HistoryMoveSingle(x, y, value, prevValue);
	}
}

export type HistoryMoveMulti = {
	type: 'multi',
	moves: HistoryMoveSingle[]
};
export type HistoryMove = HistoryMoveSingle | HistoryMoveMulti;
export type MoveSingleExport = `${number},${number},${PuzzleValue},${PuzzleValue}`;
export type MoveMultiExport = MoveSingleExport[];
export type MoveExport = MoveSingleExport | MoveMultiExport;

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
			if (lastMove.type === 'multi') {
				return {
					type: 'multi',
					moves: lastMove.moves.map(m => ({...m}))
				}
			}
			return {...lastMove};
		}
		throw new Error('Cannot undo move; there are no moves to undo.');
	}

	const importMoveHistory = (moveExports: MoveExport[] = []) => {
		reset();
		const importedMoveList: HistoryMove[] = moveExports.map(moveExport => {
			if (Array.isArray(moveExport)) {
				return {
					type: 'multi' as const,
					moves: moveExport.map(moveFromString) as HistoryMoveSingle[]
				}
			} else {
				return moveFromString(moveExport);
			}
		})
		moveList.value = importedMoveList;
	}

	const addMove = ({ x, y, value, nextValue }: Vec & { value: PuzzleValue, nextValue: PuzzleValue }) => {
		const prev = lastMove.value;
		if (prev && prev.type === 'multi') {
			// TODO: not yet implemented multi-moves in puzzleHistoryStore
			throw new Error('Not yet implemented multi-moves in puzzleHistoryStore.');
		}

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
			if (m.type === 'multi') {
				// TODO: implement multi-move in puzzleHistoryStore
				throw new Error('Not yet implemented multi-moves in puzzleHistoryStore.');
			}
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