import type { BoardAndSolutionBoards } from "@/lib/types.js";
import type { usePuzzleStore } from "@/stores/puzzle/store.js";
import type { useHintHighlightsStore } from "../highlights-store.js";

export type SteppedHintType = 'ruleViolation' | 'incorrectValues' | 'triples' | 'balance' | 'elimination' | 'elimDuplicate';
export type HintStepEventCallbackCtxParam = BoardAndSolutionBoards;
export type HintStepEventCallbackActionsParam = {
	// TODO: set certain cells in puzzleStore to a certain value, with or without adding to history, or adding to history as batch?
	makeMove: ReturnType<typeof usePuzzleStore>['makeMove'],
	removeHighlights: () => void,
	setHighlights: ReturnType<typeof useHintHighlightsStore>['setHighlights'],
	hideHighlights: () => void,
}
export type HintStepEventCallback = (
	ctx: HintStepEventCallbackCtxParam,
	actions: HintStepEventCallbackActionsParam,
) => void;

type BaseHintStepData = {
	actionLabel: string,
	message: string,
	index: number,
}
type BaseHintStepEvents = {
	onShow?: HintStepEventCallback,
	onHide?: HintStepEventCallback,
	onNext?: HintStepEventCallback,
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