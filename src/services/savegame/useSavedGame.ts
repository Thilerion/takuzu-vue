import { computed } from "vue";
import { createSharedComposable, StorageSerializers, useStorage } from "@vueuse/core";
import { readonly } from "vue";
import type { SaveData, SaveGame } from "./types";
import { getSaveData } from "./getSaveData";
const SAVE_DATA_STORAGE_KEY = 'takuzu_saved-game';

const savedPuzzle = useStorage<SaveGame | null>(SAVE_DATA_STORAGE_KEY, null, localStorage, {
	serializer: StorageSerializers.object
})

const _useSavedPuzzle = () => {
	const savePuzzle = (saveData: SaveData) => {
		const { moveList, timeElapsed } = saveData;
		if (!moveList.length || !timeElapsed || timeElapsed < 5000) {
			// do not save if no moves made and timeElapsed is very low
			return false;
		}
	
		const boardExports = {
			board: saveData.board.export(),
			solution: saveData.solution.export(),
			initialBoard: saveData.initialBoard.export()
		}
		const { width, height, difficulty } = saveData;
		const savegame: SaveGame = {
			...boardExports,
			moveList,
			timeElapsed,
			width, height, difficulty
		}
		savedPuzzle.value = savegame;
	}
	const savePuzzleSaveData = () => {
		const saveData = getSaveData();
		return savePuzzle(saveData);
	}
	const deleteSavedPuzzle = () => savedPuzzle.value = null;
	const loadPuzzle = () => {
		if (savedPuzzle.value == null) return null;

		const { width, height, board } = savedPuzzle.value;
		if (!width || !height || !board) {
			deleteSavedPuzzle();
			return null;
		}
		return readonly(savedPuzzle);
	}
	const hasCurrentSavedGame = computed(() => {
		if (savedPuzzle.value == null) return false;
		const { width, height, board } = savedPuzzle.value;
		if (!width || !height || !board) {
			deleteSavedPuzzle();
			return false;
		}
		return true;
	})

	return {
		savedPuzzle: readonly(savedPuzzle),
		hasCurrentSavedGame,
		loadPuzzle,
		deleteSavedPuzzle,
		savePuzzle,
		savePuzzleSaveData
	}
}

export const useSavedPuzzle = createSharedComposable(_useSavedPuzzle);