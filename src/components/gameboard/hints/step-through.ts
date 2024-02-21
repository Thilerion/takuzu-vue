import type { SteppedHint } from "@/stores/hints/stepped-hint/SteppedHint.js";
import { useSteppedHintEvents } from "@/stores/hints/useSteppedHintEvents.js";
import { computed, nextTick, ref, watch, type Ref } from "vue";

export const useStepThroughSteppedHint = (
	hint: Ref<SteppedHint>,
) => {
	const stepIdx = ref(0);
	const curStep = computed(() => {
		return hint.value.steps[stepIdx.value];
	})

	const {stepEvents} = useSteppedHintEvents(curStep);

	const isFirstStep = computed(() => {
		return stepIdx.value === 0;
	})
	const isFinalStep = computed(() => {
		return stepIdx.value === hint.value.steps.length - 1;
	})

	const nextStep = async () => {
		if (isFinalStep.value) return;
		// TODO: should onHide also be called?
		stepEvents.value.onNext();
		stepEvents.value.onHide();
		stepIdx.value++;
		await nextTick();
		stepEvents.value.onShow();
	}
	const prevStep = async () => {
		if (isFirstStep.value) return;
		// TODO: should onHide also be called?
		stepEvents.value.onPrev();
		stepEvents.value.onHide();
		stepIdx.value--;
		await nextTick();
		stepEvents.value.onShow();
	}
	const gotoStep = async (idx: number) => {
		if (idx < 0 || idx >= hint.value.steps.length) return;
		stepEvents.value.onHide();
		stepIdx.value = idx;
		await nextTick();
		stepEvents.value.onShow();
	}

	const resetStep = () => {
		stepIdx.value = 0;
	}

	watch(hint, () => {
		// hint changed, so reset curStep/stepIdx
		resetStep();
	})

	return { 
		stepIdx, curStep,
		isFirstStep, isFinalStep,
		nextStep, prevStep, gotoStep, resetStep,
		stepEvents,
	};
}