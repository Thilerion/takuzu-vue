import type { SimpleBoard } from "@/lib/index.js";
import type { applyTriplesConstraint } from "./TriplesConstraint.js";
import type { applyEliminationConstraint } from "./EliminationConstraint.js";
import type { applyLineBalanceConstraint } from "./LineBalanceConstraint.js";

export type ConstraintResult = {
	changed: boolean,
	error?: null
} | {
	changed: false,
	error: string
};

export type GenericApplyConstraintFn = (board: SimpleBoard, opts: { singleAction: boolean }) => ConstraintResult;

export type ConstraintFnMap = {
	'Triples': typeof applyTriplesConstraint,
	'LineBalance': typeof applyLineBalanceConstraint,
	'Elimination': typeof applyEliminationConstraint
}
export type ApplyConstraintFnType = keyof ConstraintFnMap;

export type GetApplyConstraintFnOpts<T extends ApplyConstraintFnType> = NonNullable<Parameters<ConstraintFnMap[T]>[1]>;