import type { SimpleBoard } from "@/lib";
import type { BoardString, PuzzleBoards } from "@/lib/types";
import { defineStore } from "pinia";
import { usePuzzleStore } from "../puzzle";
import { PuzzleMistakeCheck } from "./MistakeCheck";
import type { IncorrectCellMark, MistakeCheckResult, CheckAssistanceData, CheckActionSource } from "./types";

interface CheckIncorrectCellsArgs extends PuzzleBoards {
	boardStr: BoardString
}

export const usePuzzleAssistanceStore = defineStore('puzzleAssistance', {
	state: () => ({
		lastCheck: null as PuzzleMistakeCheck | null,
		cache: new Map<BoardString, MistakeCheckResult>(),
		incorrectCellsFound: new Set<IncorrectCellMark>(),
		currentMarked: [] as IncorrectCellMark[]
	}),

	getters: {
		// leftover from puzzleMistakes store
		checkId: state => state.lastCheck?.id ?? -1,
		totalUniqueChecks(): number {
			return this.uniqueChecksAmount;
		},

		mistakesFound: state => state.lastCheck != null && state.lastCheck.result.found,
		lastCheckedByUser: state => state.lastCheck?.source === 'user',


		uniqueChecksAmount: state => state.cache.size,
		uniqueChecksWithResults: state => {
			return [...state.cache.values()].filter(res => res.found);
		},
		uniqueChecksWithResultsAmount(): number {
			return this.uniqueChecksWithResults.length;
		},
		uniqueIncorrectCellsFoundAmount: (state) => state.incorrectCellsFound.size,
		checkAssistanceData(): CheckAssistanceData {
			return {
				checks: this.uniqueChecksAmount,
				checksWithResults: this.uniqueChecksWithResultsAmount,
				incorrectCellsFound: this.uniqueIncorrectCellsFoundAmount
			}
		}
	},
	actions: {
		reset() {
			this.$reset();
		},
		checkIncorrectCells(source: CheckActionSource, data: CheckIncorrectCellsArgs) {
			if (this.isCurrentCheckSameBoard(data.boardStr)) {
				// needed for re-check detection using the checkId
				this.lastCheck!.recheck();

				this.setMarkedCellsFromObject(this.lastCheck!);
				return;
			}
			const fromCache = this.getResultFromCache(data.boardStr);
			if (fromCache) {
				const lastCheck = new PuzzleMistakeCheck({
					boardStr: data.boardStr,
					source,
					...fromCache
				});
				this.lastCheck = lastCheck;
				this.setMarkedCellsFromObject(lastCheck);
				return;
			}
			// check board for incorrect cells here
			const { hasMistakes: found, result } = data.board.hasIncorrectValues(data.solution);
			const checkResult: MistakeCheckResult = found ? { found: true, cells: result! } : { found: false };
			const lastCheck = new PuzzleMistakeCheck({
				boardStr: data.boardStr,
				source,
				...checkResult
			})
			this.setCheckResult(lastCheck);
		},
		userCheckIncorrectCells(boardStr?: BoardString) {
			const puzzleStore = usePuzzleStore();
			const data = {
				boardStr: boardStr ?? puzzleStore.boardStr as BoardString,
				board: puzzleStore.board! as SimpleBoard,
				solution: puzzleStore.solution! as SimpleBoard
			}
			return this.checkIncorrectCells('user', data);
		},
		autoCheckIncorrectCells(boardStr?: BoardString) {
			const puzzleStore = usePuzzleStore();
			const data = {
				boardStr: boardStr ?? puzzleStore.boardStr as BoardString,
				board: puzzleStore.board! as SimpleBoard,
				solution: puzzleStore.solution! as SimpleBoard
			}
			return this.checkIncorrectCells('auto', data);
		},
		isCurrentCheckSameBoard(boardStr: BoardString) {
			if (this.lastCheck == null) return false;
			if (this.lastCheck.boardStr !== boardStr) return false;
			return true;
		},
		getResultFromCache(boardStr: BoardString): MistakeCheckResult | null {
			return this.cache.get(boardStr) ?? null;
		},
		addMistakeCheckToCache(value: PuzzleMistakeCheck) {
			const { boardStr } = value;
			const checkResult = { ...value.result };
			this.cache.set(boardStr, checkResult);
		},
		setCheckResult(value: PuzzleMistakeCheck) {
			this.setMarkedCellsFromObject(value);
			this.addMistakeCheckToCache(value);
			this.lastCheck = value;
		},
		setMarkedCellsFromObject(value: PuzzleMistakeCheck) {
			const marks = value.getMarkedCells();
			this.setMarkedCells(marks);
		},
		setMarkedCells(marks: IncorrectCellMark[] | null) {
			if (marks == null) {
				this.currentMarked = [];
			} else {
				this.currentMarked = [...marks];
				for (const mark of marks) {
					this.incorrectCellsFound.add(mark);
				}
			}
		},
		resetMarkedCells() {
			this.currentMarked = [];
		},
		removeFromMarkedCells(mark: IncorrectCellMark) {
			this.currentMarked = this.currentMarked.filter(val => val !== mark);
		}
	}
})