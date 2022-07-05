import { EMPTY, type PuzzleValue } from "@/lib/constants";
import type { Vec } from "@/lib/types";
import { defineStore } from "pinia";

export interface PuzzleMove extends Vec {
	value: PuzzleValue,
	prevValue: PuzzleValue
}
export type MoveExport = `${number},${number},${PuzzleValue},${PuzzleValue}`;

const isSameCell = (prevMove: PuzzleMove, x: number, y: number) => {
	return prevMove?.x === x && prevMove.y === y;
}
const moveShouldBePopped = (prevMove: PuzzleMove, value: PuzzleValue) => {
	return prevMove?.prevValue === value;
}
const combineMove = (prevMove: PuzzleMove, value: PuzzleValue) => {
	const { x, y, prevValue } = prevMove;
	return createPuzzleMove(x, y, value, prevValue);
}

export const usePuzzleHistoryStore = defineStore('puzzleHistory', {
	state: () => ({
		moveList: [] as PuzzleMove[]
	}),

	getters: {
		lastMove: state => state.moveList.length > 0 ? state.moveList.at(-1) : null,
		canUndo: state => state.moveList.length > 0
	},

	actions: {
		reset() {
			this.$reset();
		},
		popLastMove() {
			return this.moveList.pop();
		},
		editLastMove(move: PuzzleMove) {
			this.moveList.splice(-1, 1, move);
		},
		addMove({ x, y, value = EMPTY, nextValue }: Vec & { value?: PuzzleValue, nextValue: PuzzleValue }) {
			const lastMove = this.lastMove;

			// TODO: add timestamps, and don't combine moves if time difference is higher than a second or so
			if (lastMove && isSameCell(lastMove, x, y)) {
				if (moveShouldBePopped(lastMove, nextValue)) {
					// cell is back to original state
					this.popLastMove();
					return;
				} else {
					const combined = combineMove(lastMove, nextValue);
					return this.editLastMove(combined);
				}
			} else {
				const move = createPuzzleMove(x, y, nextValue, value);
				this.moveList.push(move);
			}
		},
		undoMove() {
			if (this.canUndo) {
				const lastMove = { ...this.popLastMove() } as PuzzleMove;
				return lastMove;
			}
			throw new Error('Cannot undo move.');
		},
		importMoveHistory(moveStrings: MoveExport[] = []) {
			this.reset();
			const moveList = moveStrings.map(moveFromString);
			this.moveList = moveList;
		}
	}
})

const createPuzzleMove = (x: number, y: number, value: PuzzleValue, prevValue: PuzzleValue): PuzzleMove => ({ x, y, value, prevValue });

export const moveToString = (move: PuzzleMove): MoveExport => {
	const { x, y, value, prevValue } = move;
	return `${x},${y},${value},${prevValue}`;
}
export const moveFromString = (str: MoveExport) => {
	const split = str.split(',');
	const x = parseInt(split[0]);
	const y = parseInt(split[1]);
	const value = split[2] as PuzzleValue;
	const prevValue = split[3] as PuzzleValue;
	return createPuzzleMove(x, y, value, prevValue);
}