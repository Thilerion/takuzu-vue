import { extent } from "@/utils/data-analysis.utils";
import { HINT_TYPE } from "../Hint";
import { HighlightType, hintHighlightFromType, HighlightLevel } from "./highlight.js";
import { usePuzzleStore } from "@/stores/puzzle";

export const createHighlightsFromLegacyHint = (hint, board) => {
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

function createLegacyTriplesHintHighlights(hint) {
	const xValues = hint.source.map(v => v.x);
	const yValues = hint.source.map(v => v.y);

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
			HighlightType.AREA,
			{ start, end },
			HighlightLevel.PRIMARY,
		)
	]
}

function createLegacyBalanceHintHighlights(hint, board) {
	const { targetLine, source } = hint;
	const lineId = targetLine ?? source;
	if (board == null) {
		const puzzleStore = usePuzzleStore();
		board = puzzleStore.board;
	}
	const targetHighlights = hint.targets.map(move => {
		const { x, y } = move;
		return hintHighlightFromType(
			HighlightType.CELL,
			{ x, y },
			HighlightLevel.SECONDARY,
			{ board }
		)
	})
	return [
		...targetHighlights,
		hintHighlightFromType(
			HighlightType.LINE,
			{ lineId },
			HighlightLevel.PRIMARY,
			{ board }
		)
	]
}

function createLegacyEliminationHintHighlights(hint, board) {
	const { targetLine, source } = hint;
	const lineId = targetLine ?? source;
	if (board == null) {
		const puzzleStore = usePuzzleStore();
		board = puzzleStore.board;
	}
	return [
		hintHighlightFromType(
			HighlightType.LINE,
			{ lineId },
			HighlightLevel.PRIMARY,
			{ board }
		)
	]
}

function createLegacyElimDupleHintHighlights(hint, board) {
	const { targetLine, source } = hint;
	if (board == null) {
		const puzzleStore = usePuzzleStore();
		board = puzzleStore.board;
	}
	const sourceHighlights = source.map(lineId => {
		return hintHighlightFromType(
			HighlightType.LINE,
			{ lineId },
			HighlightLevel.SECONDARY,
			{ board }
		)
	})
	return [
		hintHighlightFromType(
			HighlightType.LINE,
			{ lineId: targetLine },
			HighlightLevel.PRIMARY,
			{ board }
		),
		...sourceHighlights
	]
}