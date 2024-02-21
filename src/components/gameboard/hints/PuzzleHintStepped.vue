<template>
	<PuzzleHintBase @hide="$emit('hide')" v-show="show" :step="stepIdx">
		<template #title>Stepped hint: TODO</template>
		<template #message>{{ curStep.message }}</template>
		<template #buttons>
			<button
				:disabled="isFirstStep"
			>Prev</button>
			<button
				:disabled="isFinalStep"
			>Next</button>
			<button @click="stepEvents.onFinish">{{ curStep.actionLabel }}</button>
		</template>
	</PuzzleHintBase>
</template>

<script setup lang="ts">
import type { SteppedHint } from '@/stores/hints/stepped-hint/SteppedHint.js';
import { useSteppedHintEvents } from '@/stores/hints/useSteppedHintEvents.js';
import { toRef, watch } from 'vue';
import { useStepThroughSteppedHint } from './step-through.js';

const emit = defineEmits<{
	(e: 'hide'): void;
	(e: 'done'): void;
}>();
const props = defineProps<{
	hint: SteppedHint,
	show: boolean,
}>()
const hint = toRef(props, 'hint');

const { stepIdx, curStep, isFirstStep, isFinalStep } = useStepThroughSteppedHint(
	hint
);

const { stepEvents } = useSteppedHintEvents(curStep);

watch(() => props.show, (val, prev) => {
	if (val && !prev) {
		stepEvents.value.onShow();
	} else if (!val && prev) {
		stepEvents.value.onHide();
	}
}, { immediate: true });
</script>

<style scoped>

</style>