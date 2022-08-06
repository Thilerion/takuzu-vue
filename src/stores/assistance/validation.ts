import type { SimpleBoard } from "@/lib";
import type { BoardString, PuzzleBoards, Vec } from "@/lib/types";
import { defineStore } from "pinia";
import { usePuzzleStore } from "../puzzle";

export type MarkedMistake = `${number},${number}`;
export type CheckActionSource = 'auto' | 'user';
export type CheckActionResult = ReturnType<typeof findMistakes>;
export type CurrentCheck = {
	boardStr: BoardString,
	action: CheckActionSource,
	result: CheckActionResult
}

export const usePuzzleValidationStore = defineStore('puzzleValidation', {
	state: () => ({
		userChecks: 0,
		lastCheck: null as CurrentCheck | null,
		previousResults: new Map<BoardString, CheckActionResult>(),

		markedMistakes: [] as MarkedMistake[]
	}),

	getters: {
		checkAssistanceData() {
			// TODO: used for puzzleFinished history state later
			return {};
		},
		mistakesFound: state => !!(state.lastCheck?.result?.found),
		lastCheckedByUser: state => state.lastCheck?.action === 'user',
	},

	actions: {
		userCheck() {
			this.userChecks += 1;

			const data = getRequiredDataFromPuzzleStore();
			const { boardStr } = data;

			// check if current result still applies
			if (this._currentResultStillApplies(boardStr)) {
				// set marked cells again to be sure
				this._setMarkedMistakes();
				return;
			}

			// check previous results first for match
			const prev = this._getResultFromPreviousResults(boardStr);
			if (prev) {
				this._setLastCheck({
					boardStr,
					action: 'user',
					result: prev
				}, { addToPrevious: false });
				return;
			}

			const result = findMistakes(data);
			this._setLastCheck({
				boardStr,
				action: 'user',
				result
			}, { addToPrevious: true });
		},
		resetMarkedMistakes() {
			this.markedMistakes = [];
		},
		removeFromMarkedMistakes(cellOrMark: MarkedMistake | Vec) {
			const mark = markedMistakeFromCellOrString(cellOrMark);
			this.markedMistakes = this.markedMistakes.filter(val => val !== mark);	
		},
		reset() {
			this.$reset();
		},

		// PRIVATE ACTIONS
		_setLastCheck(data: CurrentCheck, { addToPrevious = true } = {}) {
			this.lastCheck = {
				boardStr: data.boardStr,
				action: data.action,
				result: data.result
			}
			if (addToPrevious) {
				this.previousResults.set(data.boardStr, data.result);
			}
			this._setMarkedMistakes();
		},
		_getResultFromPreviousResults(boardStr: BoardString) {
			const prev = this.previousResults.get(boardStr);
			if (prev == null) return false;
			return prev;
			
		},
		_currentResultStillApplies(boardStr: BoardString) {
			if (this.lastCheck == null) return false;
			if (this.lastCheck.boardStr !== boardStr) return false;
			return true;
		},
		_setMarkedMistakes() {
			if (!this.lastCheck?.result.found) return;
			this.markedMistakes = this.lastCheck.result.cells.map(vecToMark);
		}
	}
})

const getRequiredDataFromPuzzleStore = () => {
	const puzzleStore = usePuzzleStore();
	const boardStr = puzzleStore.boardStr as BoardString;
	const board = puzzleStore.board! as SimpleBoard;
	const solution = puzzleStore.solution! as SimpleBoard;
	return { boardStr, board, solution };
}

const findMistakes = ({ board, solution }: PuzzleBoards): { found: false } | { found: true, cells: Vec[] } => {
	const { hasMistakes, result } = board.hasIncorrectValues(solution);
	if (!hasMistakes) return { found: false };
	return { found: true, cells: result }
}
const vecToMark = ({ x, y }: Vec): MarkedMistake => `${x},${y}`;
const markedMistakeFromCellOrString = (cellOrMark: Vec | MarkedMistake): MarkedMistake => {
	return typeof cellOrMark === 'string' ? cellOrMark : vecToMark(cellOrMark);
}