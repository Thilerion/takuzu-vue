<template>
	<PuzzleHintBase @hide="$emit('hide')" v-show="show" :step="stepIdx">
		<template #title>{{ title }}<small class="text-sm opacity-80 ml-[0.5ch]" v-if="subtitle">{{ subtitle }}</small></template>
		<template #message>{{ stepMessage }}</template>
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
			><transition name="stepchange" mode="out-in"><span :key="stepIdx">{{ curStep.actionLabel }}<span v-if="!isFinalStep" class="ml-[1ch]">&#x3E;</span></span></transition></button>
		</template>
	</PuzzleHintBase>
</template>

<script setup lang="ts">
import { computed, toRef, watch } from 'vue';
import { useStepThroughSteppedHint } from './step-through.js';
import type { SteppedHint } from '@/stores/hints/stepped-hint/types.js';
import { useDynamicPuzzleSymbolString } from '@/components/dynamic-symbols/useDynamicPuzzleSymbolString.js';
import { initGlobalCellThemeProvider } from '../composables/useCellThemeProvider.js';
import { useSteppedHintMessage } from './stepped-hint-message.js';

const emit = defineEmits<{
	(e: 'hide'): void;
	(e: 'done'): void;
}>();
const props = defineProps<{
	hint: SteppedHint,
	show: boolean,
}>()
const hint = toRef(props, 'hint');

const { stepIdx, curStep, isFirstStep, isFinalStep, nextStep, prevStep, resetStep, stepEvents } = useStepThroughSteppedHint(
	hint
);

const themeData = initGlobalCellThemeProvider();
const { $p } = useDynamicPuzzleSymbolString(themeData.theme, themeData.type);

const { message } = useSteppedHintMessage(hint, stepIdx, $p);

const stepMessage = computed((): string => {
	if (message.value != null) {
		return message.value;
	}
	console.error('UseSteppedHintMessage gave no message.');
	return '';
})
const subtitle = computed((): string | null => {
	const type = hint.value.type;
	switch(type) {
		case 'triples': {
			return hint.value.subType;
		}
		case 'balance': {
			return null;
		}
		default: {
			const x: never = type;
			console.warn(`Unexpected stepped hint type ${x}`);
			return null;
		}
	}
})
const title = computed(() => {
	const type = hint.value.type;
	let base: string;
	switch(type) {
		case 'triples': {
			base = 'Triples';
			break;
		}
		case 'balance': {
			base = 'Balanced Lines';
			break;
		}
		default: {
			const x: never = type;
			console.warn(`Unexpected stepped hint type ${x}`);
			base = 'Hint';
			break;
		}
	}
	if (subtitle.value != null) {
		base += ':';
	} 
	return base;
})

const onAction = () => {
	if (isFinalStep.value) {
		stepEvents.value.onFinish();
		// reset step, so when the actions are undone, and the hint is shown again, we start again at the first step
		resetStep();
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
/* 
.step-change transition classes come from "PuzzleHintBase.vue"
} */
</style>