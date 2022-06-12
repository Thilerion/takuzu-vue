import { COLUMN, ROW } from "@/lib/constants";
import { columnIdToX, lineTypeFromLineId, rowIdToY } from "@/lib/utils";

// can be shown as multiple colors; ie a duplicate line hint may want to show the possible duplicate lines as a different color than the target line
export const HighlightLevel = {
	PRIMARY: 'PRIMARY',
	SECONDARY: 'SECONDARY'
}
const defaultLevel = HighlightLevel.PRIMARY;
export const HighlightType = {
	CELL: 'CELL',
	LINE: 'LINE',
	AREA: 'AREA'
}


const CellHighlight = ({ x, y }, level = defaultLevel) => {
	return {
		type: HighlightType.CELL,
		level,
		cell: { x, y },
	}
}
const LineHighlight = ({ lineId }, level = defaultLevel, board) => {
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
const AreaHighlight = ({ start, end }, level = defaultLevel) => {
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
export const hintHighlightFromType = (hlType, data, level, { board } = {}) => {
	switch (hlType) {
		case HighlightType.CELL:
			return CellHighlight(data, level, board);
		case HighlightType.LINE:
			return LineHighlight(data, level, board);
		case HighlightType.AREA:
			return AreaHighlight(data, level, board);
		default:
			throw new Error(`Highlight type "${hlType}" has no associated highlight factory function; can't create a Hint Highlight.`);
	}
}

function lineHighlightEndPoints({
	lineId, lineType, board
}) {
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
	return { start, end };
}
