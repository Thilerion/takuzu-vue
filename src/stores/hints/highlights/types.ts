import type { LineType } from "@/lib/constants.js";
import type { LineId, Vec } from "@/lib/types.js";

export type HighlightType = 'CELL' | 'LINE' | 'AREA';
export type HighlightLevel = 'PRIMARY' | 'SECONDARY';
export type HintCellHighlight = {
	type: 'CELL',
	level: HighlightLevel,
	cell: Vec
}
export type HintLineHighlight = {
	type: 'LINE',
	level: HighlightLevel,
	start: Vec,
	end: Vec,
	context: {
		lineId?: LineId,
		lineType?: LineType,
		width: number,
		height: number
	}
}
export type HintAreaHighlight = {
	type: 'AREA',
	level: HighlightLevel,
	start: Vec,
	end: Vec,
	context: {
		width: number,
		height: number
	}
}
export type HintHighlight = HintCellHighlight | HintLineHighlight | HintAreaHighlight;