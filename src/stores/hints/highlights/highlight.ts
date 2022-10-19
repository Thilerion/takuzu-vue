import type { SimpleBoard } from "@/lib";
import { COLUMN, ROW, type LineType } from "@/lib/constants";
import type { BoardShape, ColumnId, LineId, RowId, Vec } from "@/lib/types";
import { columnIdToX, lineTypeFromLineId, rowIdToY } from "@/lib/utils";

// can be shown as multiple colors; ie a duplicate line hint may want to show the possible duplicate lines as a different color than the target line
type HlLevel = 'PRIMARY' | 'SECONDARY';
export const HighlightLevel: {
	[P in HlLevel]: P
} = {
	PRIMARY: 'PRIMARY',
	SECONDARY: 'SECONDARY'
} as const;
const defaultLevel = HighlightLevel.PRIMARY;

type HlType = 'CELL' | 'LINE' | 'AREA';
export const HighlightType: {
	[P in HlType]: P
} = {
	CELL: 'CELL',
	LINE: 'LINE',
	AREA: 'AREA'
	} as const;


interface ICellHighlight {
	type: 'CELL',
	level: HlLevel,
	cell: Vec
}
const CellHighlight = ({ x, y }: Vec, level: HlLevel = defaultLevel): ICellHighlight => {
	return {
		type: HighlightType.CELL,
		level,
		cell: { x, y },
	}
}

interface ILineHighlight {
	type: 'LINE',
	level: HlLevel,
	context: {
		lineId: LineId,
		lineType: LineType,
		width: number,
		height: number
	},
	start: Vec,
	end: Vec
}
const LineHighlight = ({ lineId }: { lineId: LineId }, level: HlLevel = defaultLevel, board: SimpleBoard): ILineHighlight => {
	const lineType = lineTypeFromLineId(lineId);
	const { start, end } = lineHighlightEndPoints({
		lineId, lineType, board
	});
	const height = lineType === ROW ? 1 : end.y + 1;
	const width = lineType === COLUMN ? 1 : end.x + 1;
	
	return {
		type: HighlightType.LINE,
		level,
		context: { lineId, lineType, width, height },
		start,
		end
	}
}

interface IAreaHighlight {
	type: 'AREA',
	level: HlLevel,
	context: BoardShape,
	start: Vec,
	end: Vec
}
const AreaHighlight = ({ start, end }: { start: Vec, end: Vec }, level: HlLevel = defaultLevel): IAreaHighlight => {
	const { x: x0, y: y0 } = start;
	const { x: x1, y: y1 } = end;

	const width = x1 - x0 + 1;
	const height = y1 - y0 + 1;

	return {
		type: HighlightType.AREA,
		level,
		context: { width, height },
		start,
		end
	}
}

export function hintHighlightFromType(hlType: 'CELL', data: Parameters<typeof CellHighlight>[0], level: HlLevel): ReturnType<typeof CellHighlight>;
export function hintHighlightFromType(hlType: 'LINE', data: Parameters<typeof LineHighlight>[0], level: HlLevel, boardObj: { board: SimpleBoard }): ReturnType<typeof LineHighlight>;
export function hintHighlightFromType(hlType: 'AREA', data: Parameters<typeof AreaHighlight>[0], level: HlLevel): ReturnType<typeof AreaHighlight>;
export function hintHighlightFromType(hlType: HlType, data: any, level: HlLevel, boardObj?: { board: SimpleBoard }) {
	switch (hlType) {
		case HighlightType.CELL:
			return CellHighlight(data, level);
		case HighlightType.LINE:
			const board = boardObj!.board;
			return LineHighlight(data, level, board);
		case HighlightType.AREA:
			return AreaHighlight(data, level);
		default:
			const x: never = hlType;
			throw new Error(`Highlight type "${x}" has no associated highlight factory function; can't create a Hint Highlight.`);
	}
}

function lineHighlightEndPoints({
	lineId, lineType, board
}: { lineId: LineId, lineType: LineType, board: SimpleBoard }): { start: Vec, end: Vec } {
	let start, end;
	if (lineType === ROW) {
		const rowId = lineId as RowId;
		const y = rowIdToY(rowId);
		start = {
			x: 0, y
		}
		end = {
			x: board.width - 1, y
		}
	} else if (lineType === COLUMN) {
		const colId = lineId as ColumnId;
		const x = columnIdToX(colId);
		start = {
			x, y: 0
		};
		end = {
			x, y: board.height - 1
		}
	} else {
		const x: never = lineType;
		throw new Error('Incorrect lineType.');
	}
	return { start, end };
}
