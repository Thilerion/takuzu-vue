import type { BoardExportString } from "@/lib/types.js";
import { defineStore } from "pinia";
import { computed, ref, watchEffect } from "vue";
import { usePuzzleStore } from "./puzzle/store.js";
import { getTotalTimeElapsed } from "./puzzle/timer-store.js";
import { SimpleBoard } from "@/lib/board/Board.js";

type BookmarkType = 'user' | 'lastCorrect';
type BaseBookmark<Type extends BookmarkType> = {
	board: BoardExportString;
	type: Type;
}

export type UserBookmark = BaseBookmark<'user'> & {
	/** Auto-incrementing (per puzzle) id, also used in name/label of bookmark */
	id: number;
	/** Progress percentage (proportion) at moment bookmark was saved */
	progress: number;
	/** Time elapsed at moment bookmark was saved */
	timerOnSave: number;
}

export type LastCorrectStateBookmark = BaseBookmark<'lastCorrect'>;

export const usePuzzleBookmarksStore = defineStore('puzzleBookmarks', () => {
	const bookmarks = ref<UserBookmark[]>([]);
	let prevBookmarkId: null | number = null;

	/** Track the last correct state, ie the last point at which there were no errors in the puzzle. Can be used to revert to the last known correct state when there are many mistakes. */
	const lastCorrectStateBookmark = ref<LastCorrectStateBookmark | null>(null);
	const updateLastCorrectStateBookmark = (boardString?: BoardExportString) => {
		const bookmark: LastCorrectStateBookmark = {
			type: 'lastCorrect',
			board: boardString ?? usePuzzleStore().boardExportStr!
		}
		lastCorrectStateBookmark.value = bookmark;
	}
	// This is not the most efficient way of doing this. It would be preferable to check
	// for mistakes in a central location (such as the assistance or validation store), but
	// this will do for now.
	const puzzleStore = usePuzzleStore();
	watchEffect(() => {
		const board = puzzleStore.board;

		if (board == null) {
			lastCorrectStateBookmark.value = null;
			return;
		}

		const { hasMistakes } = board.hasIncorrectValues(puzzleStore.solution!);
		if (!hasMistakes) {
			updateLastCorrectStateBookmark(puzzleStore.boardExportStr!);
		} else if (hasMistakes && lastCorrectStateBookmark.value == null) {
			// TODO: this should be prevented by adding the lastCorrectStateBookmark to the save game, because this can happen if a saved game is loaded that has mistakes in it
			console.warn('Board has mistakes, but lastCorrectStateBookmark is null. This should not happen. This is probably due to loading a saved game with mistakes.');
			// TODO: fallback for now is using the initial board state
			updateLastCorrectStateBookmark(puzzleStore.solution!.export());
		}
	})

	const getNextId = (): number => {
		if (prevBookmarkId == null && bookmarks.value.length > 0) {
			const maxId = bookmarks.value.reduce((max, b) => Math.max(max, b.id), 0);
			prevBookmarkId = maxId;
			return maxId + 1;
		} else if (prevBookmarkId == null) {
			prevBookmarkId = 0;
			return 0;
		} else {
			return prevBookmarkId += 1;
		}
	}

	const hasBoardStateInBookmarks = (state: BoardExportString) => {
		return bookmarks.value.some(b => b.board === state);
	}
	const canSaveCurrentBoardStateAsBookmark = computed((): boolean => {
		const board = puzzleStore.board;
		if (board == null || !puzzleStore.hasStarted || puzzleStore.finished) return false;
		const progress = puzzleStore.progress;
		if (progress == null || progress === 0 || progress === 1) return false;
		return !hasBoardStateInBookmarks(puzzleStore.boardExportStr!);
	})
	const currentBoardIsSaved = computed(() => {
		const board = puzzleStore.board;
		if (board == null) return false;
		return hasBoardStateInBookmarks(puzzleStore.boardExportStr!);
	})

	const saveStateAsBookmark = () => {
		if (!canSaveCurrentBoardStateAsBookmark.value) {
			console.warn('Cannot save current board state as bookmark, already exists in bookmarks, or invalid game status.');
			return;
		}
		const bookmark: UserBookmark = createUserBookmarkFromCurrentState(getNextId());
		bookmarks.value.push(bookmark);
	}

	/** The previous bookmark that was saved. This excludes any bookmarks that are equal to the current board. */
	const previousBookmark = computed((): UserBookmark | null => {
		if (bookmarks.value.length === 0) return null;
		const currentBoard = puzzleStore.board;
		if (currentBoard == null) return null;
		const currentBoardString = puzzleStore.boardExportStr!;
		
		// Find the last bookmark where board is not the current board string
		const bookmark = bookmarks.value.findLast(bm => bm.board !== currentBoardString);
		return bookmark ?? null;
	})

	const loadBookmark = (id: number) => {
		const bookmark = bookmarks.value.find(b => b.id === id);
		if (bookmark == null) {
			console.warn('Cannot load bookmark with id:', id);
			return;
		}
		const board = SimpleBoard.import(bookmark.board);
		puzzleStore.loadBookmarkedPuzzleState(board);
	}

	const reset = () => {
		bookmarks.value = [];
		lastCorrectStateBookmark.value = null;
		prevBookmarkId = null;
	}
	const importBookmarks = (arr: UserBookmark[]) => {
		bookmarks.value = [...arr];
		const maxId = arr.reduce((max, b) => Math.max(max, b.id), 0);
		prevBookmarkId = maxId;
	}

	const deleteBookmark = (id: number) => {
		const idx = bookmarks.value.findIndex(b => b.id === id);
		if (idx === -1) {
			console.warn('Cannot delete bookmark with id:', id);
			return;
		}
		bookmarks.value.splice(idx, 1);	
	}

	return {
		bookmarks,
		previousBookmark,
		reset,
		saveStateAsBookmark,
		loadBookmark,
		deleteBookmark,
		importBookmarks,
		canSaveCurrentBoardStateAsBookmark,
		currentBoardIsSaved,

		lastCorrectStateBookmark,
		updateLastCorrectStateBookmark,
	}
})

function createUserBookmarkFromCurrentState(id: number): UserBookmark {
	const puzzleStore = usePuzzleStore();
	const { progress, boardExportStr } = puzzleStore;
	const bookmark: UserBookmark = {
		type: 'user',
		id,
		board: boardExportStr!,
		progress,
		timerOnSave: getTotalTimeElapsed()
	};
	return bookmark;
}