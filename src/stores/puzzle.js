import { EMPTY } from "@/lib/constants.js";
import { SaveGameData } from "@/services/save-game.js";
import { defineStore } from "pinia";
import { useBasicStatsStore } from "./basic-stats.js";
import { usePuzzleHintsStore } from "./puzzle-hinter.js";
import { usePuzzleHistoryStore } from "./puzzle-history.js";
import { usePuzzleMistakesStore } from "./puzzle-mistakes.js";
import { usePuzzleTimer } from "./puzzle-timer.js";
import { useSettingsStore } from "./settings.js";

export const usePuzzleStore = defineStore('puzzle', {
	state: () => ({
		// game config
		width: null,
		height: null,
		numCells: null,
		difficulty: null,

		// game boards and state
		initialBoard: null,
		board: null,
		solution: null,
		solutionBoardStr: null,

		initialEmpty: null,
		rowCounts: [],
		colCounts: [],
		gridCounts: {},

		// play/ui state
		initialized: false,
		started: false,
		paused: false,
		finished: false,

		// game creation state/error
		loading: false,
		creationError: false,
	}),

	getters: {
		toggleArray: () => {
			const settingsStore = useSettingsStore();
			if (settingsStore.toggleMode === '0') {
				return ['0', '1', '.'];
			} else return ['1', '0', '.'];
		},

		boardStr: state => state.board?.toString(),
		boardFilled: state => state.gridCounts[EMPTY] === 0,
		finishedAndSolved(state) {
			if (state.board == null || !state.initialized || !state.started) return false;
			if (!this.boardFilled) return false;
			return state.solutionBoardStr !== this.boardStr;
		},
		progress: state => {
			const initialEmpty = state.initialEmpty;
			const currentEmpty = state.gridCounts[EMPTY];
			const progress = 1 - (currentEmpty / initialEmpty);
			return progress;
		}
	},

	actions: {
		pauseGame(value) {
			this.paused = value;
			const timer = usePuzzleTimer();
			if (value) {
				timer.pause();
			} else timer.resume();
		},
		setBoardAndCountValue({ x, y, value, prevValue }) {
			this.board.assign(x, y, value);
			this.gridCounts[value] += 1;
			this.gridCounts[prevValue] -= 1;
			this.rowCounts[y][value] += 1;
			this.rowCounts[y][prevValue] -= 1;
			this.colCounts[x][value] += 1;
			this.colCounts[x][prevValue] -= 1;
		},
		setValue({ x, y, value, prevValue }) {
			if (!prevValue) {
				prevValue = this.board.grid[y][x];
			}
			if (!value) throw new Error('Value required in setValue');
			this.setBoardAndCountValue({ x, y, value, prevValue });

			usePuzzleMistakesStore().removeFromCurrentMarkedCells(`${x},${y}`);
			usePuzzleHintsStore().showHint = false;
		},
		toggle({ x, y, value, prevValue }) {
			if (!prevValue) {
				prevValue = this.board.grid[y][x];
			}
			if (!value) {
				const toggleArr = this.toggleArray;
				const idx = toggleArr.indexOf(prevValue);
				const nextIdx = (idx + 1) % 3;
				value = toggleArr[nextIdx];
			}
			this.setValue({ x, y, value, prevValue });
			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.addMove({ x, y, value: prevValue, nextValue: value });
		},
		undoLastMove() {
			const puzzleHistory = usePuzzleHistoryStore();
			const move = { ...puzzleHistory.lastMove };
			puzzleHistory.undoMove();
			const { x, y, prevValue: value, value: prevValue } = move;
			this.setValue({ x, y, value, prevValue });
		},
		async createPuzzle({ width, height, difficulty }) {
			// TODO
		},
		async initPuzzle(puzzleConfig) {
			// TODO
		},
		finishPuzzle() {
			this.finished = true;
			const timer = usePuzzleTimer();
			timer.pause();

			let timeElapsed = timer.timeElapsed;
			const checkAssistanceData = usePuzzleMistakesStore().checkAssistanceData;
			const hintAssistanceData = usePuzzleHintsStore().hintAssistanceData;
			const finishedPuzzleState = {
				...state, timeElapsed, assistance: {
					checkData: checkAssistanceData,
					hintData: hintAssistanceData
				}
			};
			console.log({ ...finishedPuzzleState });
			const basicStatsStore = useBasicStatsStore();

			return basicStatsStore.addFinishedPuzzleToHistory(finishedPuzzleState).then(historyEntry => {
				console.log('Puzzle saved to history.');
				SaveGameData.deleteSavedGame();
				return historyEntry;
			})
		}
	}

})