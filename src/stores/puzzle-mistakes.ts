import type { SimpleBoard } from "@/lib";
import type { BoardString, Flavor } from "@/lib/types";
import { defineStore } from "pinia";
import { usePuzzleStore } from "./puzzle";

type CheckId = Flavor<number, 'checkId'>;
type IncorrectCheckValue = `${number},${number}`;
type CacheValue = IncorrectCheckValue[] | null;
interface BoardAndSolution {
	board: SimpleBoard,
	solution: SimpleBoard
}
interface CheckIncorrectCellsArgs extends BoardAndSolution {
	boardStr: BoardString
}

export const usePuzzleMistakesStore = defineStore('puzzleMistakes', {
	state: () => ({
		checkId: -1 as CheckId,
		cache: new Map<string, CacheValue>(),
		totalCellsFound: new Set<IncorrectCheckValue>(),
		currentMarked: [] as IncorrectCheckValue[],
		lastCheckType: null as null | 'user' | 'auto'
	}),

	getters: {
		totalUniqueChecks: state => state.cache.size,
		totalUniqueChecksWithResults: state => {
			const arr = Array.from(state.cache.values());
			// return arr.filter(val => val?.length).length;
			return arr;
		}
	},

	actions: {
		reset() {
			this.$reset();
		},
		checkIncorrectCells(data: CheckIncorrectCellsArgs) {
			const hasInCache = this.cache.has(data.boardStr);
			// Have already checked with hasInCache
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			let result: CacheValue;
			if (hasInCache) {
				result = this.cache.get(data.boardStr) as CacheValue;
			} else {
				result = this._checkAndSetToCache(data);
			}
			if (!Array.isArray(result)) {
				result = [];
			}
			result.forEach(cellId => {
				this.totalCellsFound.add(cellId);
			})
			this.$patch({
				currentMarked: [...result],
				checkId: this.checkId + 1
			})
		},
		_checkAndSetToCache(data: CheckIncorrectCellsArgs): CacheValue {
			const result = checkForIncorrectCells(data);
			this.cache.set(data.boardStr, result);
			return result;
		},

		checkErrors(boardStr: BoardString) {
			const puzzleStore = usePuzzleStore();
			// TODO 05-07-2022 remove cast when puzzle store is typed
			this.checkIncorrectCells({
				boardStr,
				board: puzzleStore.board as unknown as SimpleBoard,
				solution: puzzleStore.solution as unknown as SimpleBoard,
			});
		},
		userCheckErrors(boardStr: BoardString) {
			this.lastCheckType = 'user';
			this.checkErrors(boardStr);
		},
		// runs when puzzle is finished but not valid, will mark mistakes
		autoCheckFinishedWithMistakes() {
			// TODO 05-07-2022 remove cast when puzzle store is typed
			const boardStr = usePuzzleStore().boardStr as BoardString;
			this.lastCheckType = 'auto';
			this.checkErrors(boardStr);
		},
		resetMarkedCells() {
			this.currentMarked = [];
		},
		removeFromCurrentMarkedCells(cellId: IncorrectCheckValue) {
			const filtered = this.currentMarked.filter(val => val !== cellId);
			this.currentMarked = filtered;
		}
	}
})

function checkForIncorrectCells(data: BoardAndSolution) {
	const { hasMistakes, result } = data.board.hasIncorrectValues(data.solution);
	if (!hasMistakes) {
		return null;
	}
	return result.map(({ x, y }): IncorrectCheckValue => `${x},${y}`)
}