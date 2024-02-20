<template>
	<PuzzleHintBase @hide="$emit('hide')">
		<template #title>Stepped hint: TODO</template>
		<template #message>A stepped hint component has not yet been implemented.</template>
	</PuzzleHintBase>
</template>

<script setup lang="ts">
import type { HintStepOnCallback, SteppedHint } from '@/stores/hints/stepped-hint/SteppedHint.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { computed, ref, toRef, watch, watchEffect } from 'vue';

const emit = defineEmits<{
	(e: 'hide'): void;
	(e: 'done'): void;
}>();
const props = defineProps<{
	hint: SteppedHint,
	show: boolean,
}>()
const hint = toRef(props, 'hint');

const curStepIdx = ref(0);
const curStep = computed(() => hint.value.steps[curStepIdx.value]);

const puzzleStore = usePuzzleStore();
const hintStepCallback = computed((): Parameters<HintStepOnCallback> => {
	const board = puzzleStore.board!;
	const solution = puzzleStore.solution!;
	const ctx = { board, solution };
	return [
		ctx,
		{
			hideHighlights: () => {},
			setHighlights: () => {},
			toggle: () => {}
		}
	]
})

const onShow = computed(() => {
	return curStep.value.onShow;
})
const onHide = computed(() => {
	return curStep.value.onHide;
})

watch(() => props.show, (val, prev) => {
	if (val && !prev) {
		onShow.value?.(...hintStepCallback.value);
	} else if (!val && prev) {
		onHide.value?.(...hintStepCallback.value);
	}
}, { immediate: true });
</script>

<style scoped>

</style>