import type { BoardAndSolutionBoards } from "@/lib/types.js";
import type { usePuzzleStore } from "@/stores/puzzle/store.js";
import type { useHintHighlightsStore } from "../highlights-store.js";
import type { HintHighlight } from "../highlights/types.js";
import type { Ref } from "vue";
import type { TriplesSteppedHint } from "./TriplesHint.js";
import type { BalanceSteppedHint } from "./BalanceHint.js";
import type { IncorrectValuesSteppedHint } from "./IncorrectValuesHint.js";
import type { NoHintsFoundSteppedHint } from "./NoHintsFoundHint.js";
import type { GenericEliminationSteppedHint } from "./GenericEliminationHint.js";

export type SteppedHintType = 'ruleViolation' | 'incorrectValues' | 'triples' | 'balance' | 'eliminationGeneric' | 'noHintsFound';
export type HintStepEventCallbackCtxParam = BoardAndSolutionBoards;
export type HintStepEventCallbackActionsParam = {
	// TODO: set certain cells in puzzleStore to a certain value, with or without adding to history, or adding to history as batch?
	makeMove: ReturnType<typeof usePuzzleStore>['makeMove'],
	makeMultipleMoves: ReturnType<typeof usePuzzleStore>['makeMultipleMoves'],
	removeHighlights: () => void,
	setHighlights: ReturnType<typeof useHintHighlightsStore>['setHighlights'],
	currentHighlights: Ref<HintHighlight[]>,
	showHighlights: () => void,
	hideHighlights: () => void,
}
export type HintStepEventCallback = (
	ctx: HintStepEventCallbackCtxParam,
	actions: HintStepEventCallbackActionsParam,
) => void;

type BaseHintStepData = {
	actionLabel: string,
	index: number,
	// TODO: secondary actions? for instance, with mistakes, the primary action is fix all, and the secondary action might be revert to last correct boardState
}
type BaseHintStepEvents = {
	onShow?: HintStepEventCallback,
	onHide?: HintStepEventCallback,
	onNext?: HintStepEventCallback,
	onPrev?: HintStepEventCallback,
}
export type HintStepIntermediate = BaseHintStepData & BaseHintStepEvents & {
	onFinish?: undefined;
};
export type HintStepFinal = BaseHintStepData & BaseHintStepEvents & {
	onFinish: HintStepEventCallback,
};
export type HintStep = HintStepIntermediate | HintStepFinal;

type GetEventKeys<Obj> = keyof {
	[K in keyof Obj as K extends `on${infer _Rest}` ? K : never]: K;
};
export type HintStepEvent = GetEventKeys<Required<HintStepIntermediate> & Required<HintStepFinal>>;

export type SteppedHint = TriplesSteppedHint | BalanceSteppedHint | IncorrectValuesSteppedHint | GenericEliminationSteppedHint | NoHintsFoundSteppedHint;