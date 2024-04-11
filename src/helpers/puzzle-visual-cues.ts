import type { BoardShape, LineId, Vec, XYKey } from "@/lib/types.js"
import { columnIdToX, getLineDataFromId, rowIdToY } from "@/lib/utils/puzzle-line.utils.js"

type HighlightBase = {
	type: 'highlight',
	colorId: number, // similar to "highlightLevel", but more generic
	source: 'hint', // only hints as source for now
}
export type CellHighlight = HighlightBase & {
	highlightAreaType: 'cell',
	cell: Vec
}
export type LineHighlight = HighlightBase & {
	highlightAreaType: 'line',
	start: Vec,
	width: number,
	height: number,
}
export type AreaHighlight = HighlightBase & {
	highlightAreaType: 'area',
	start: Vec,
	width: number,
	height: number,
}
export type PuzzleBoardHighlight = CellHighlight | LineHighlight | AreaHighlight;
export type PuzzleBoardHighlightSource = PuzzleBoardHighlight['source'];

type ErrorMarkBase = {
	cell: Vec,
	id: XYKey,
	type: 'error'
}
export type IncorrectValueErrorMark = ErrorMarkBase & {
	errorType: 'incorrectValue', // only incorrect values for now
}
export type ErrorMark = IncorrectValueErrorMark; // for now, incorrectValue is the only marked error
export type ErrorMarkErrorType = ErrorMark['errorType'];
export type PuzzleBoardCellMark = ErrorMark; // for now, only type of mark is the error mark

export const createCellHighlight = (
	cell: Vec,
	data: Omit<CellHighlight, 'cell' | 'type' | 'highlightAreaType'>
): CellHighlight => {
	const {
		colorId,
		source,
	} = data;
	return {
		type: 'highlight',
		colorId,
		source,
		highlightAreaType: 'cell',
		cell: { ...cell },
	}
}

export const createAreaHighlightFromCorners = (
	start: Vec, end: Vec,
	data: Pick<AreaHighlight, 'colorId' | 'source'>
): AreaHighlight => {
	const { colorId, source } = data;
	return {
		type: 'highlight',
		colorId,
		source,
		highlightAreaType: 'area',
		start: {...start},
		width: end.x - start.x + 1,
		height: end.y - start.y + 1,
	}
}

export const createLineHighlightFromLineId = (
	_lineId: LineId,
	boardShape: BoardShape,
	data: Pick<LineHighlight, 'colorId' | 'source'>
): LineHighlight => {
	const {lineType, lineId} = getLineDataFromId(_lineId);
	let x = 0;
	let y = 0;

	if (lineType === 'row') {
		y = rowIdToY(lineId);
	} else if (lineType === 'column') {
		x = columnIdToX(lineId);
	}
	const start = { x, y };
	const { colorId, source } = data;
	const width = lineType === 'row' ? boardShape.width : 1;
	const height = lineType === 'column' ? boardShape.height : 1;
	return {
		type: 'highlight',
		colorId,
		source,
		highlightAreaType: 'line',
		start,
		width,
		height,
	}
}