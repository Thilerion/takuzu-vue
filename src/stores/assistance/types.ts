import type { BoardString, Vec } from "@/lib/types";

export type MarkedMistake = `${number},${number}`;
export type CheckActionSource = 'auto' | 'auto-filled' | 'user';
export type CheckActionResult = { found: false } | { found: true, cells: Vec[] };
export type CurrentCheck = {
	boardStr: BoardString,
	action: CheckActionSource,
	result: CheckActionResult
}