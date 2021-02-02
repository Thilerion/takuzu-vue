import { columnIdToX, lineTypeFromLineId, rowIdToY } from "@/lib/utils"

const rowIdToGridArea = (rowId) => {
	const y = rowIdToY(rowId);
	return {
		column: 1,
		row: y + 2
	}
} 
const colIdToGridArea = (colId) => {
	const x = columnIdToX(colId);
	return {
		column: x + 2,
		row: 1
	}
}
export const lineIdToGridArea = (lineId) => {
	const fn = lineTypeFromLineId(lineId) === 'row' ? rowIdToGridArea : colIdToGridArea;
	return fn(lineId);
}