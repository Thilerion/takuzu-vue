import type { SimpleBoard } from "@/lib";
import type { BoardString, PuzzleBoards, Vec } from "@/lib/types";
import { defineStore } from "pinia";
import { usePuzzleStore } from "../puzzle";
import { markedMistakeFromCellOrString, vecToMark } from "./helpers";
import type { CheckActionResult, CurrentCheck, MarkedMistake } from "./types";

export const usePuzzleValidationStore = defineStore('puzzleValidation', {
	state: () => ({
		userChecks: 0,
		lastCheck: null as CurrentCheck | null,
		previousUserCheckResults: new Map<BoardString, CheckActionResult>(),
		previousAutoFilledCheckResults: new Map<BoardString, CheckActionResult>(),

		markedMistakes: [] as MarkedMistake[],
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
			if (this._currentResultStillApplies(boardStr)) return;

			// check previous results first for match
			const prev = this._getFromPreviousUserCheckResults(boardStr);
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
		autoFilledBoardCheck() {
			const data = getRequiredDataFromPuzzleStore();
			const { boardStr } = data;

			// check if previous result still applies first
			if (this._currentResultStillApplies(boardStr)) return;

			// check previous (autoFilledCheck) results for match
			const prevAutoFilled = this._getFromPreviousAutoFilledCheckResults(boardStr);
			if (prevAutoFilled) {
				this._setLastCheck({
					boardStr,
					action: 'auto-filled',
					result: prevAutoFilled
				}, { addToPrevious: false });
				return;
			}

			const result = findMistakes(data);
			this._setLastCheck({
				boardStr,
				action: 'auto-filled',
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
				if (data.action === 'user') {
					this.previousUserCheckResults.set(data.boardStr, data.result);
				} else if (data.action === 'auto-filled') {
					this.previousAutoFilledCheckResults.set(data.boardStr, data.result);
				} else {
					throw new Error('Add to previous what results?');
				}
			}
			this._setMarkedMistakes();
		},
		_getFromPreviousUserCheckResults(boardStr: BoardString) {
			const prev = this.previousUserCheckResults.get(boardStr);
			if (prev == null) return false;
			return prev;			
		},
		_getFromPreviousAutoFilledCheckResults(boardStr: BoardString) {
			const prev = this.previousAutoFilledCheckResults.get(boardStr);
			if (prev == null) return false;
			return prev;
		},
		_currentResultStillApplies(boardStr: BoardString) {
			if (this.lastCheck == null) return false;
			if (this.lastCheck.boardStr !== boardStr) return false;

			// set marked cells again to be sure
			this._setMarkedMistakes();
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

const findMistakes = ({ board, solution }: PuzzleBoards): CheckActionResult => {
	const { hasMistakes, result } = board.hasIncorrectValues(solution);
	if (!hasMistakes) return { found: false };
	return { found: true, cells: result }
}