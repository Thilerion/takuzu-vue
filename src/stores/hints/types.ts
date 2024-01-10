import type { LineId, Target, Vec } from "@/lib/types.js";
import type { Hint } from "./Hint.js";
import type { SimpleBoard } from "@/lib/index.js";
import type { PuzzleValue } from "@/lib/constants.js";

export type HintType = 'MISTAKE' | 'TRIPLES' | 'BALANCE' | 'ELIMINATION' | 'ELIM_DUPE';
export type HintTarget = Vec & { value: PuzzleValue };
export type HintTargetLine = LineId; // TODO: what else?
export type HintSource = LineId[] | Vec[] | [Vec, Vec]; // TODO: what else?
export type HintActionFn = (hint: Hint) => void;
export type HintAction = {
	label: string;
	fn: HintActionFn;
}
export type HintValidatorCtx = {
	board: SimpleBoard;
	solution: SimpleBoard;
}
export type HintValidatorFn = (ctx: HintValidatorCtx) => boolean;