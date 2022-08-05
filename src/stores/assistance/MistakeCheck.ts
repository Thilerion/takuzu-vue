import type { BoardString, Vec } from "@/lib/types";
import type { CheckActionSource, IncorrectCellMark, MistakeCheckResult } from "./types";

let nextCheckId = 1;
export const initNextCheckId = (previous: number) => nextCheckId = previous + 1;
const getNextCheckId = () => nextCheckId++;

export type MistakeCheckConstructorParams = {
	source: CheckActionSource,
	boardStr: BoardString,
	found: false
} | {
	source: CheckActionSource,
	boardStr: BoardString,
	found: true,
	cells: Vec[]
}

export class PuzzleMistakeCheck {
	id: number = getNextCheckId();
	source: CheckActionSource;
	result: MistakeCheckResult;
	boardStr: BoardString;

	constructor(data: MistakeCheckConstructorParams) {
		this.source = data.source;
		this.boardStr = data.boardStr;

		if (data.found) {
			this.result = { found: true, cells: data.cells }
		} else {
			this.result = { found: false };
		}
	}

	getMarkedCells(): IncorrectCellMark[] | null {
		if (!this.result.found) return null;
		return this.result.cells.map(({ x, y }) => {
			return `${x},${y}` as const;
		})
	}
	recheck() {
		this.id = getNextCheckId();
	}
}