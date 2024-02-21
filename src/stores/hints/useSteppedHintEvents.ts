import { computed, toValue } from "vue";
import { usePuzzleStore } from "../puzzle/store.js";
import type { HintStep, HintStepEvent, HintStepOnCallback } from "./stepped-hint/SteppedHint.js";
import { useHintHighlightsStore } from "./highlights-store.js";
import type { ReadonlyRefOrGetter } from "@vueuse/core";

export const useSteppedHintEvents = (
	stepRef: ReadonlyRefOrGetter<HintStep | null | undefined>
) => {
	const puzzleStore = usePuzzleStore();
	const ctx = computed((): Parameters<HintStepOnCallback>[0] => ({
		board: puzzleStore.board!,
		solution: puzzleStore.solution!,
	}));

	const highlightsStore = useHintHighlightsStore();

	const actions = computed((): Parameters<HintStepOnCallback>[1] => ({
		hideHighlights: highlightsStore.hide,
		removeHighlights: highlightsStore.clear,
		setHighlights: highlightsStore.setHighlights,
		toggle: () => {}
	}));

	const params = computed((): Parameters<HintStepOnCallback> => {
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
			onFinish: createEventHandler('onFinish'),
		}
		return handlers;
	})

	return { params, stepEvents: eventHandlers };
}