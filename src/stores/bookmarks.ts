import type { BoardExportString } from "@/lib/types.js";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { usePuzzleStore } from "./puzzle/store.js";
import { getTotalTimeElapsed } from "./puzzle/timer-store.js";
import { SimpleBoard } from "@/lib/index.js";

export type Bookmark = {
	/** Auto-incrementing (per puzzle) id, also used in name/label of bookmark */
	id: number;
	/** Board state (BoardExportString) */
	board: BoardExportString;
	/** Progress percentage (proportion) at moment bookmark was saved */
	progress: number;
	/** Time elapsed at moment bookmark was saved */
	timerOnSave: number;

	/* TODO: BookmarkType: if manually saved by user, or is auto-generated for "last known correct puzzle state", etc */
}

export const usePuzzleBookmarksStore = defineStore('puzzleBookmarks', () => {
	const bookmarks = ref<Bookmark[]>([]);
	let prevBookmarkId: null | number = null;
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
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		if (board == null || !puzzleStore.hasStarted || puzzleStore.finished) return false;
		const progress = puzzleStore.progress;
		if (progress == null || progress === 0 || progress === 1) return false;
		return !hasBoardStateInBookmarks(board.export());
	})
	const currentBoardIsSaved = computed(() => {
		const board = usePuzzleStore().board;
		if (board == null) return false;
		return hasBoardStateInBookmarks(board.export());
	})
	const saveStateAsBookmark = () => {
		const puzzleStore = usePuzzleStore();
		const { progress, board: boardState } = puzzleStore;
		const board: BoardExportString = boardState!.export();
		if (!canSaveCurrentBoardStateAsBookmark.value) {
			console.warn('Cannot save current board state as bookmark, already exists in bookmarks, or invalid game status.');
			return;
		}
		const bookmark: Bookmark = {
			id: getNextId(),
			board,
			progress,
			timerOnSave: getTotalTimeElapsed()
		}
		bookmarks.value.push(bookmark);
	}

	/** The previous bookmark that was saved. This excludes any bookmarks that are equal to the current board. */
	const previousBookmark = computed((): Bookmark | null => {
		if (bookmarks.value.length === 0) return null;
		const currentBoard = usePuzzleStore().board;
		if (currentBoard == null) return null;
		const currentBoardString = currentBoard.export();
		
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
		const puzzleStore = usePuzzleStore();
		puzzleStore.loadBookmarkedPuzzleState(board);
	}

	const reset = () => {
		bookmarks.value = [];
		prevBookmarkId = null;
	}
	const importBookmarks = (arr: Bookmark[]) => {
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
	}
})