import type { Vec } from "@/lib/types";

export type CheckActionSource = 'user' | 'auto';
export type IncorrectCellMark = `${number},${number}`;
export type MistakeCheckResult = {
	found: false
} | { found: true, cells: Vec[] };
export interface CheckAssistanceData {
	checks: number,
	checksWithResults: number,
	incorrectCellsFound: number
}