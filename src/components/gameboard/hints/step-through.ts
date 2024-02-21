import type { SteppedHint } from "@/stores/hints/stepped-hint/SteppedHint.js";
import { computed, ref, type Ref } from "vue";

export const useStepThroughSteppedHint = (
	hint: Ref<SteppedHint>,
) => {
	const stepIdx = ref(0);
	const curStep = computed(() => {
		return hint.value.steps[stepIdx.value];
	})

	const isFirstStep = computed(() => {
		return stepIdx.value === 0;
	})
	const isFinalStep = computed(() => {
		return stepIdx.value === hint.value.steps.length - 1;
	})

	const nextStep = () => {
		if (isFinalStep.value) return;
		stepIdx.value++;
	}
	const prevStep = () => {
		if (isFirstStep.value) return;
		stepIdx.value--;
	}
	const gotoStep = (idx: number) => {
		if (idx < 0 || idx >= hint.value.steps.length) return;
		stepIdx.value = idx;
	}

	return { 
		stepIdx, curStep,
		isFirstStep, isFinalStep,
		nextStep, prevStep, gotoStep
	};
}