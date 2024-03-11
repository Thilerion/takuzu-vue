import { COLUMN, ROW } from "@/lib/constants";
import type { HighlightLevel, HighlightType, HintAreaHighlight, HintCellHighlight, HintHighlight, HintLineHighlight } from "./types.js";
import type { ColumnId, LineId, RowId, Vec } from "@/lib/types.js";
import type { SimpleBoard } from "@/lib/index.js";
import { extent } from "@/utils/data-analysis.utils.js";
import { getLineDataFromId, rowIdToY, columnIdToX } from "@/lib/utils/puzzle-line.utils.js";

// can be shown as multiple colors; ie a duplicate line hint may want to show the possible duplicate lines as a different color than the target line
export const HIGHLIGHT_LEVELS = {
	PRIMARY: 'PRIMARY',
	SECONDARY: 'SECONDARY'
} as const satisfies Record<HighlightLevel, HighlightLevel>;
const defaultLevel: HighlightLevel = HIGHLIGHT_LEVELS.PRIMARY;
export const HIGHLIGHT_TYPES = {
	CELL: 'CELL',
	LINE: 'LINE',
	AREA: 'AREA'
} as const satisfies Record<HighlightType, HighlightType>;


const CellHighlight = ({ x, y }: Vec, level: HighlightLevel = defaultLevel): HintCellHighlight => {
	return {
		type: HIGHLIGHT_TYPES.CELL,
		level,
		cell: { x, y },
	}
}
const LineHighlight = ({ lineId }: { lineId: LineId }, level: HighlightLevel = defaultLevel, board: SimpleBoard): HintLineHighlight => {
	const lineData = getLineDataFromId(lineId);
	const { start, end } = lineHighlightEndPoints({
		...lineData, board
	});
	if (start == null || end == null) {
		throw new Error(`Line highlight end points are null for lineId "${lineId}"`);
	}
	const height = lineData.lineType === ROW ? 1 : end.y + 1;
	const width = lineData.lineType === COLUMN ? 1 : end.x + 1;

	return {
		type: HIGHLIGHT_TYPES.LINE,
		level,
		context: { ...lineData, width, height },
		start,
		end
	}
}
const AreaHighlight = ({ start, end }: Pick<HintAreaHighlight, 'start' | 'end'>, level: HighlightLevel = defaultLevel): HintAreaHighlight => {
	const { x: x0, y: y0 } = start;
	const { x: x1, y: y1 } = end;

	const width = x1 - x0 + 1;
	const height = y1 - y0 + 1;

	return {
		type: HIGHLIGHT_TYPES.AREA,
		level,
		context: { width, height },
		start,
		end
	}
}

export const createAreaHighlightAroundCells = (
	cells: Vec[],
	level: HighlightLevel = defaultLevel
): HintAreaHighlight => {
	const xValues = cells.map(v => v.x);
	const yValues = cells.map(v => v.y);

	const [minX, maxX] = extent(xValues);
	const [minY, maxY] = extent(yValues);
	const start = {
		x: minX, y: minY
	};
	const end = {
		x: maxX, y: maxY
	}
	return AreaHighlight({ start, end}, level);
}
export const createCellHighlight = (
	vec: Vec,
	level: HighlightLevel = defaultLevel
) => {
	return CellHighlight(vec, level);
}
export const createLineHighlight = (
	lineId: LineId,
	level: HighlightLevel = defaultLevel,
	board: SimpleBoard
) => {
	return LineHighlight({ lineId }, level, board);
}

export function hintHighlightFromType(
	hlType: typeof HIGHLIGHT_TYPES.CELL,
	data: Vec,
	level?: HighlightLevel
): HintCellHighlight;
export function hintHighlightFromType(
	hlType: typeof HIGHLIGHT_TYPES.LINE,
	data: { lineId: LineId; },
	level: HighlightLevel,
	{ board }: { board: SimpleBoard; }
): HintLineHighlight;
export function hintHighlightFromType(
	hlType: typeof HIGHLIGHT_TYPES.AREA,
	data: Pick<HintAreaHighlight, 'start' | 'end'>,
	level: HighlightLevel
): HintAreaHighlight;
export function hintHighlightFromType(hlType: HighlightType,
	data: Vec | { lineId: LineId; } | Pick<HintAreaHighlight, 'start' | 'end'>,
	level?: HighlightLevel,
	{ board }: { board?: SimpleBoard; } = {}
): HintHighlight {
	switch (hlType) {
		case HIGHLIGHT_TYPES.CELL:
			return CellHighlight(data as any, level);
		case HIGHLIGHT_TYPES.LINE:
			return LineHighlight(data as any, level, board!);
		case HIGHLIGHT_TYPES.AREA:
	return AreaHighlight(data as any, level);
				default:
			throw new Error(`Highlight type "${hlType}" has no associated highlight factory function; can't create a Hint Highlight.`);
	}
}

type LineHlEndPointsParam = {
	lineId: RowId,
	lineType: typeof ROW,
	board: SimpleBoard
} | {
	lineId: ColumnId,
	lineType: typeof COLUMN,
	board: SimpleBoard
}
function lineHighlightEndPoints({
	lineId, lineType, board
}: LineHlEndPointsParam): { start: Vec, end: Vec } {
	let start, end;
	if (lineType === ROW) {
		const y = rowIdToY(lineId);
		start = {
			x: 0, y
		}
		end = {
			x: board.width - 1, y
		}
	} else if (lineType === COLUMN) {
		const x = columnIdToX(lineId);
		start = {
			x, y: 0
		};
		end = {
			x, y: board.height - 1
		}
	}
	return { start, end } as { start: Vec, end: Vec };
}
