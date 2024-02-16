import { extent } from "@/utils/data-analysis.utils";
import { HINT_TYPE, Hint } from "../Hint";
import { HIGHLIGHT_TYPES, hintHighlightFromType, HIGHLIGHT_LEVELS } from "./highlight";
import type { SimpleBoard } from "@/lib/index.js";
import type { HintAreaHighlight, HintCellHighlight, HintLineHighlight } from "./types.js";
import type { LineId, Vec } from "@/lib/types.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";

export const createHighlightsFromLegacyHint = (hint: Hint, board: SimpleBoard) => {
	switch (hint.type) {
		case HINT_TYPE.TRIPLES:
			return createLegacyTriplesHintHighlights(hint);
		case HINT_TYPE.BALANCE:
			return createLegacyBalanceHintHighlights(hint, board);
		case HINT_TYPE.ELIMINATION:
			return createLegacyEliminationHintHighlights(hint, board);
		case HINT_TYPE.ELIM_DUPE:
			return createLegacyElimDupleHintHighlights(hint, board);
		default:
			console.warn(`This is a legacy hint type (${hint.type}) that has no factory function for highlights`);
			return [];
	}
}

function createLegacyTriplesHintHighlights(hint: Hint): HintAreaHighlight[] {
	const source = hint.source as Vec[];
	const xValues = source.map(v => v.x);
	const yValues = source.map(v => v.y);

	const [minX, maxX] = extent(xValues);
	const [minY, maxY] = extent(yValues);
	const start = {
		x: minX, y: minY
	};
	const end = {
		x: maxX, y: maxY
	}
	return [
		hintHighlightFromType(
			HIGHLIGHT_TYPES.AREA,
			{ start, end },
			HIGHLIGHT_LEVELS.PRIMARY,
		)
	]
}

function createLegacyBalanceHintHighlights(hint: Hint, board: SimpleBoard): (HintCellHighlight | HintLineHighlight)[] {
	const { targetLine, source } = hint;
	const lineId = targetLine ?? source[0] as LineId;
	if (board == null) {
		const puzzleStore = usePuzzleStore();
		board = puzzleStore.board!;
	}
	const targetHighlights = (hint.targets as Vec[]).map((move: Vec) => { /* TODO: remove cast */
		const { x, y } = move;
		return hintHighlightFromType(
			HIGHLIGHT_TYPES.CELL,
			{ x, y },
			HIGHLIGHT_LEVELS.SECONDARY,
		)
	})
	return [
		...targetHighlights,
		hintHighlightFromType(
			HIGHLIGHT_TYPES.LINE,
			{ lineId },
			HIGHLIGHT_LEVELS.PRIMARY,
			{ board }
		)
	]
}

function createLegacyEliminationHintHighlights(hint: Hint, board: SimpleBoard): HintLineHighlight[] {
	const { targetLine, source } = hint;
	const lineId = targetLine ?? source[0] as LineId;
	if (board == null) {
		const puzzleStore = usePuzzleStore();
		board = puzzleStore.board!;
	}
	const hl = hintHighlightFromType(
		HIGHLIGHT_TYPES.LINE,
		{ lineId },
		HIGHLIGHT_LEVELS.PRIMARY,
		{ board }
	)
	return [hl];
}

function createLegacyElimDupleHintHighlights(hint: Hint, board: SimpleBoard): HintLineHighlight[] {
	const { targetLine, source } = hint;
	if (board == null) {
		const puzzleStore = usePuzzleStore();
		board = puzzleStore.board!;
	}
	if (targetLine == null) {
		throw new Error(`targetLine is null for elimDupe hint ${hint.id}`);
	}
	const sourceHighlights = (source as LineId[]).map(lineId => {
		return hintHighlightFromType(
			HIGHLIGHT_TYPES.LINE,
			{ lineId },
			HIGHLIGHT_LEVELS.SECONDARY,
			{ board }
		)
	})
	return [
		hintHighlightFromType(
			HIGHLIGHT_TYPES.LINE,
			{ lineId: targetLine },
			HIGHLIGHT_LEVELS.PRIMARY,
			{ board }
		),
		...sourceHighlights
	]
}