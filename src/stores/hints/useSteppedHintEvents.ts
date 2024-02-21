import { computed, toValue } from "vue";
import { usePuzzleStore } from "../puzzle/store.js";
import { useHintHighlightsStore } from "./highlights-store.js";
import type { ReadonlyRefOrGetter } from "@vueuse/core";
import type { HintStep, HintStepEventCallback, HintStepEvent, HintStepEventCallbackActionsParam, HintStepEventCallbackCtxParam } from "./stepped-hint/types.js";

export const useSteppedHintEvents = (
	stepRef: ReadonlyRefOrGetter<HintStep | null | undefined>
) => {
	const puzzleStore = usePuzzleStore();
	const ctx = computed((): HintStepEventCallbackCtxParam => ({
		board: puzzleStore.board!,
		solution: puzzleStore.solution!,
	}));

	const highlightsStore = useHintHighlightsStore();

	const actions = computed((): HintStepEventCallbackActionsParam => ({
		hideHighlights: highlightsStore.hide,
		removeHighlights: highlightsStore.clear,
		setHighlights: highlightsStore.setHighlights,
		makeMove: puzzleStore.makeMove,
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