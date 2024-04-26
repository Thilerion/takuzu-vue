import { computed } from "vue";
import { createSharedComposable, StorageSerializers, useStorage } from "@vueuse/core";
import { readonly } from "vue";
import type { SaveData, SaveGame } from "./types";
import { getSaveData } from "./getSaveData";
import { SimpleBoard } from "@/lib/board/Board.js";
const SAVE_DATA_STORAGE_KEY = 'takuzu_saved-game';

const savedPuzzle = useStorage<SaveGame | null>(SAVE_DATA_STORAGE_KEY, null, localStorage, {
	serializer: StorageSerializers.object
})

const _useSavedPuzzle = () => {
	const savePuzzle = (saveData: SaveData): boolean => {
		const { moveList, timeElapsed } = saveData;

		const boardExport = saveData.board.export();
		const initialBoardExport = saveData.initialBoard.export();
		if (boardExport === initialBoardExport || !timeElapsed || timeElapsed < 1000) {
			// do not save if no moves made and timeElapsed is very low
			return false;
		}
	
		const boardExports = {
			board: boardExport,
			solution: saveData.solution.export(),
			initialBoard: initialBoardExport
		}
		const { width, height, difficulty, bookmarks, hints } = saveData;
		const savegame: SaveGame = {
			...boardExports,
			moveList,
			timeElapsed,
			width, height, difficulty,
			bookmarks,
			hints,
		}
		savedPuzzle.value = savegame;
		return true;
	}
	const savePuzzleSaveData = () => {
		const saveData = getSaveData();
		return savePuzzle(saveData);
	}
	const deleteSavedPuzzle = () => savedPuzzle.value = null;
	const hasCurrentSavedGame = computed(() => {
		if (savedPuzzle.value == null) return false;
		const { width, height, board } = savedPuzzle.value;
		if (!width || !height || !board) {
			deleteSavedPuzzle();
			return false;
		}
		return true;
	})

	const getParsedSavedPuzzle = () => {
		if (savedPuzzle.value == null) return null;
		const data: SaveGame = { ...savedPuzzle.value };
		const {
			// puzzle config
			width, height, difficulty,
			// boards
			initialBoard, board, solution,
			// misc stored data
			moveList,
			timeElapsed,
			bookmarks,
			hints
		} = data;
		return {
			config: { width, height, difficulty },
			boards: {
				initialBoard: SimpleBoard.fromString(initialBoard),
				board: SimpleBoard.fromString(board),
				solution: SimpleBoard.fromString(solution),
			},
			moveList,
			timeElapsed,
			bookmarks,
			hints
		};
	}

	return {
		savedPuzzle: readonly(savedPuzzle),
		hasCurrentSavedGame,
		deleteSavedPuzzle,
		savePuzzleSaveData,
		getParsedSavedPuzzle,
	}
}

export const useSavedPuzzle = createSharedComposable(_useSavedPuzzle);