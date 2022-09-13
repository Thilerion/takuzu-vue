import { COLUMN, ROW } from "@/lib/constants";
import { columnIdToX, lineTypeFromLineId, rowIdToY } from "@/lib/utils";
import { SimpleBoard } from "../../../lib/board/Board";
import { LineType, LineId } from "../../../lib/constants";
import { Vec } from "../../../lib/types";
import type { LineHL, AreaHL, CellHL } from "./types";
import { HighlightLevel, defaultLevel, HighlightType } from "./types";
export { HighlightLevel, HighlightType } from './types';
// can be shown as multiple colors; ie a duplicate line hint may want to show the possible duplicate lines as a different color than the target line

const CellHighlight = (vec: Vec, level: HighlightLevel = defaultLevel): CellHL => {
	const { x, y } = vec;
	return {
		type: HighlightType.CELL,
		level,
		cell: { x, y },
	}
}
const LineHighlight = ({ lineId }, level = defaultLevel, board): LineHL => {
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
const AreaHighlight = ({ start, end }, level = defaultLevel): AreaHL => {
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

export type HlEndPointsArgs = {
	lineId: LineId,
	lineType: LineType,
	board: SimpleBoard
}
function lineHighlightEndPoints({
	lineId, lineType, board
}: HlEndPointsArgs) {
	if (lineType === ROW) {
		const y = rowIdToY(lineId);
		const start = {
			x: 0, y
		}
		const end = {
			x: board.width - 1, y
		}
		return { start, end };
	} else if (lineType === COLUMN) {
		const x = columnIdToX(lineId);
		const start = {
			x, y: 0
		};
		const end = {
			x, y: board.height - 1
		}
		return { start, end };
	} else {
		throw new Error(`Unrecognized LineType: ${lineType}`);
	}
}
