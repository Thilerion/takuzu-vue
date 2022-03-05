import { useStorage } from "@vueuse/core"
import { computed, readonly } from "vue";
const STORAGE_KEY = 'takuzu_saved-game';

const savedPuzzle = useStorage(STORAGE_KEY, null, undefined, {
	serializer: {
		read: v => JSON.parse(v) ?? null,
		write: v => JSON.stringify(v)
	}
});

const savePuzzle = ({
	width, height,
	difficulty,
	moveList,
	timeElapsed,
	initialBoard,
	solution,
	board }) => {
	const exportedBoards = {
		board: board.export(),
		solution: solution.export(),
		initialBoard: initialBoard.export()
	}
	savedPuzzle.value = {
		...exportedBoards,
		width, height,
		difficulty,
		moveList,
		timeElapsed
	};
}

const deleteSavedPuzzle = () => {
	savedPuzzle.value = null;
}

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

export const useSavedPuzzle = () => {

	return {
		savedPuzzle: readonly(savedPuzzle),
		hasCurrentSavedGame,

		loadPuzzle,
		deleteSavedPuzzle,
		savePuzzle
	}
}