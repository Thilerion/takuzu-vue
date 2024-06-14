<template>
<input
	ref="el"
	type="text"
	class="w-full border-0 p-1 m-0 aspect-square h-full text-center editor-cell-input placeholder:text-gray-300"
	:data-symbol="dataSymbolAttr"
	:value="inputValue"
	:placeholder="solutionValue ?? ''"
	inputmode="numeric"
	enterkeyhint="next"
	@input="handleInput"
	@blur="handleBlur($event as FocusEvent)"
	@focus="handleFocus($event as FocusEvent)"
	@keydown.delete="handleDelete"
>
</template>

<script setup lang="ts">
import { isPuzzleSymbol } from '@/lib/utils/puzzle-value.utils.js';
import { ref, computed, watch, nextTick } from 'vue';
import { EMPTY, type PuzzleSymbol, type PuzzleValue } from '@/lib/constants.js';

const INPUT_EMPTY_VAL = '';
type InputEmptyVal = typeof INPUT_EMPTY_VAL;

const el = ref<HTMLInputElement>();

const props = defineProps<{
	modelValue: PuzzleValue,
	solutionValue: PuzzleValue | null,
}>();

const dataSymbolAttr = computed(() => {
	return props.modelValue === EMPTY ? undefined : props.modelValue;
})

const emit = defineEmits<{
	/** Update the value of the cell. */
	(e: 'update:modelValue', v: PuzzleValue): void,
	/** Focus and select previous cell in table, if there is one. */
	(e: 'to-prev'): void,
	/** Focus and select next cell in table, if there is one. */
	(e: 'to-next'): void,
}>();

const inputValue = ref<PuzzleSymbol | InputEmptyVal>(INPUT_EMPTY_VAL);
watch([() => props.modelValue, el], ([mv, inputEl]) => {
	inputValue.value = mv === EMPTY ? INPUT_EMPTY_VAL : mv;
	if (inputEl == null) return;
	inputEl.value = inputValue.value;
}, { immediate: true, flush: 'post' });

const handleInput = (e: Event) => {
	if ((e as InputEvent).inputType.startsWith('delete')) {
		updateValue(INPUT_EMPTY_VAL);
		e.preventDefault();
		return;
	}
	const target = e.target as HTMLInputElement;
	const newValue = target.value;

	updateValue(newValue);
	e.preventDefault();
	emit('to-next');
}
const updateValue = (value: string | null | undefined) => {
	if (typeof value === 'string' && value.length > 1) {
		value = value.at(-1);
	}
	let newValue: PuzzleValue = EMPTY;
	if (value == null) {
		newValue = EMPTY;
	} else if (isPuzzleSymbol(value)) {
		newValue = value;
	} else if (value.trim() === INPUT_EMPTY_VAL || value === EMPTY) {
		newValue = EMPTY;
	} else {
		console.warn(`Unknown update value: ${value}. Setting to empty.`);
		newValue = EMPTY;
	}
	emit('update:modelValue', newValue);

	nextTick(() => {
		// if "." was input, the modelValue doesn't change but the input value now contains a "."
		// so we need to update the input value
		if (el.value != null && el.value.value !== inputValue.value) {
			console.log('updating input value');
			el.value.value = inputValue.value;
		}
	})
}

/** Just in case the input value is not correct, update it automatically after a blur event. */
const handleBlur = async (ev: FocusEvent) => {
	const tg = ev.target as HTMLInputElement;
	if (tg.value !== inputValue.value) tg.value = inputValue.value;
}

const handleFocus = (ev: FocusEvent) => {
	const tg = ev.target as HTMLInputElement;
	tg.select();
}

const handleDelete = (ev: Event) => {
	const hasCellValue = props.modelValue !== EMPTY;

	updateValue(INPUT_EMPTY_VAL);

	// if the cell already had no value prior to the deletion, go to the previous cell
	if (!hasCellValue) {
		emit('to-prev');
		ev.preventDefault();	
	}
}

defineExpose({ el });

</script>

<style scoped>
[data-symbol="0"] {
	@apply bg-cell-blue-lighter/30;
}
[data-symbol="1"] {
	@apply bg-cell-red-lighter/20;
}
</style>