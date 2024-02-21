import type { SteppedHint } from "@/stores/hints/stepped-hint/types.js";
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
		stepEvents.value.onNext();
		stepIdx.value++;
		await nextTick();
		stepEvents.value.onShow();
	}
	const prevStep = async () => {
		if (isFirstStep.value) return;
		stepEvents.value.onPrev();
		stepIdx.value--;
		await nextTick();
		stepEvents.value.onShow();
	}
	const gotoStep = async (idx: number) => {
		if (idx < 0 || idx >= hint.value.steps.length) return;
		if (idx < stepIdx.value) {
			while (idx !== stepIdx.value) {
				await prevStep();
			}
		} else if (idx > stepIdx.value) {
			while (idx !== stepIdx.value) {
				await nextStep();
			}
		}
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