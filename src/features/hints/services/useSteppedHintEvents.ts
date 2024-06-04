import { computed, toValue } from "vue";
import type { ReadonlyRefOrGetter } from "@vueuse/core";
import type { HintStep, HintStepEventCallback, HintStepEvent, HintStepEventCallbackActionsParam, HintStepEventCallbackCtxParam } from "./SteppedHint/types.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { usePuzzleVisualCuesStore } from "@/features/puzzle-visual-cues/store.js";
import type { PuzzleBoardHighlight } from "@/features/puzzle-visual-cues/helpers/highlights.js";

export const useSteppedHintEvents = (
	stepRef: ReadonlyRefOrGetter<HintStep | null | undefined>
) => {
	const puzzleStore = usePuzzleStore();
	const ctx = computed((): HintStepEventCallbackCtxParam => ({
		board: puzzleStore.board!,
		solution: puzzleStore.solution!,
	}));

	const visualCuesStore = usePuzzleVisualCuesStore();
	const currentHighlights = computed<PuzzleBoardHighlight[]>({
		get: (): PuzzleBoardHighlight[] => {
			return [...visualCuesStore.highlights];
		},
		set: (value: PuzzleBoardHighlight[]) => {
			visualCuesStore.highlights = [...value];
		}
	})

	const actions = computed((): HintStepEventCallbackActionsParam => ({
		hideHighlights: visualCuesStore.hideHighlights,
		removeHighlights: visualCuesStore.clearHighlightsFromHints,
		setHighlights: visualCuesStore.setHintHighlights,
		addErrorMarksFromCells: visualCuesStore.addErrorMarksFromCells,
		currentHighlights: currentHighlights,
		showHighlights: visualCuesStore.showHighlights,
		makeMove: puzzleStore.makeMove,
		makeMultipleMoves: puzzleStore.makeMultipleMoves,
	}));

	const params = computed((): Parameters<HintStepEventCallback> => {
		return [
			ctx.value,
			actions.value
		]
	})

	const createEventHandler = (
		eventName: HintStepEvent
	): (() => void) => {
		return (): void => {
			const step = toValue(stepRef);
			step?.[eventName]?.(...params.value);
		}
	}

	const eventHandlers = computed((): Record<HintStepEvent, () => void> => {
		const handlers: Record<HintStepEvent, () => void> = {
			onShow: createEventHandler('onShow'),
			onHide: createEventHandler('onHide'),
			onNext: createEventHandler('onNext'),
			onPrev: createEventHandler('onPrev'),
			onFinish: createEventHandler('onFinish'),
		}
		return handlers;
	})

	return { params, stepEvents: eventHandlers };
}