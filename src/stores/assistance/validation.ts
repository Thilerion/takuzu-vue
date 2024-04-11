import type { BoardString, BoardAndSolutionBoards } from "@/lib/types";
import { defineStore } from "pinia";
import type { CheckActionResult, CurrentCheck } from "./types";
import { usePuzzleStore } from "../puzzle/store.js";
import { usePuzzleVisualCuesStore, type ErrorMarkErrorType } from "../puzzle-visual-cues.js";

export const usePuzzleValidationStore = defineStore('puzzleValidation', {
	state: () => ({
		userChecks: 0,
		lastCheck: null as CurrentCheck | null,
		previousUserCheckResults: new Map<BoardString, CheckActionResult>(),
		previousAutoFilledCheckResults: new Map<BoardString, CheckActionResult>(),
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
			// TODO: implement check action: ruleViolations (currently only checks for incorrectValues)
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
		/** Removes all error marks, and replaces them with new error marks according to the results of the last check */
		_setMarkedMistakes(type: ErrorMarkErrorType = 'incorrectValue') {
			const visualCuesStore = usePuzzleVisualCuesStore();
			visualCuesStore.clearErrorMarks();
			
			if (!this.lastCheck?.result.found) return;
			visualCuesStore.addErrorMarksFromCells(
				type,
				this.lastCheck.result.cells
			);
		}
	}
})

const getRequiredDataFromPuzzleStore = (): BoardAndSolutionBoards & { boardStr: BoardString } => {
	const puzzleStore = usePuzzleStore();
	const boardStr = puzzleStore.boardStr;
	const board = puzzleStore.board;
	const solution = puzzleStore.solution;
	if (boardStr == null || board == null || solution == null) throw new Error('Missing required data from puzzle store');
	return { boardStr, board, solution };
}

const findMistakes = ({ board, solution }: BoardAndSolutionBoards): CheckActionResult => {
	const { hasMistakes, result } = board.hasIncorrectValues(solution);
	if (!hasMistakes) return { found: false };
	return { found: true, cells: result }
}