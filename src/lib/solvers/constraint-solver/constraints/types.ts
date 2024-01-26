import type { SimpleBoard } from "@/lib/index.js";

export type ConstraintResult = {
	changed: boolean,
	error?: null
} | {
	changed: false,
	error: string
};

export type GenericApplyConstraintFn = (board: SimpleBoard, opts: { singleAction: boolean }) => ConstraintResult;