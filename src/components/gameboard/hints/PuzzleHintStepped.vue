<template>
	<PuzzleHintBase @hide="$emit('hide')" v-show="show" :step="stepIdx">
		<template #title>Stepped hint: TODO</template>
		<template #message>{{ curStep.message }}</template>
		<template #buttons>
			<button
				:disabled="isFirstStep"
				@click="prevStep"
				class="text-sm text-slate-700 bg-white border-r min-w-fit w-24 py-1 flex-grow max-w-[27%] disabled:text-slate-400 disabled:bg-slate-50"
			><span class="mr-[1ch]">&#x3C;</span>Back</button>
			<div class="flex-1">
				<!-- Space for secondary actions, or [Learn more] button, etc -->
			</div>
			<button
				@click="onAction"
				class="text-sm flex-grow text-slate-700 bg-white border-l min-w-fit w-24 py-1 max-w-[27%]"
			>{{ curStep.actionLabel }}<span v-if="!isFinalStep" class="ml-[1ch]">&#x3E;</span></button>
		</template>
	</PuzzleHintBase>
</template>

<script setup lang="ts">
import type { SteppedHint } from '@/stores/hints/stepped-hint/SteppedHint.js';
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

const { stepIdx, curStep, isFirstStep, isFinalStep, nextStep, prevStep, stepEvents } = useStepThroughSteppedHint(
	hint
);

const onAction = () => {
	if (isFinalStep.value) {
		stepEvents.value.onFinish();
	} else {
		nextStep();
	}
}

watch(() => props.show, (val, prev) => {
	if (val && !prev) {
		stepEvents.value.onShow();
	} else if (!val && prev) {
		// if hidden, which can also happen with onFinish(), also trigger onHide()
		stepEvents.value.onHide();
	}
}, { immediate: true });
</script>

<style scoped>

</style>