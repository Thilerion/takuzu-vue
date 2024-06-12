<template>
<input
	ref="el"
	type="text"
	class="w-full border-0 p-1 m-0 aspect-square h-full text-center"
	:value="inputValue"
	inputmode="numeric"
	enterkeyhint="next"
	@input="handleInput"
	@blur="handleBlur($event as FocusEvent)"
	@focus="handleFocus($event as FocusEvent)"
>
</template>

<script setup lang="ts">
import { isPuzzleSymbol } from '@/lib/utils/puzzle-value.utils.js';
import { watchEffect, ref } from 'vue';
import type { PuzzleSymbol, PuzzleValue } from '@/lib/constants.js';

const el = ref<HTMLInputElement>();

const props = defineProps<{
	modelValue: PuzzleValue
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', v: PuzzleValue): void,
	(e: 'to-prev'): void,
	(e: 'to-next'): void,
}>();

const inputValue = ref<PuzzleSymbol | ''>('');
watchEffect(() => {
	if (inputValue.value !== props.modelValue) {
		const newValue = props.modelValue === '.' ? '' : props.modelValue;
		inputValue.value = newValue;
	}
	if (el.value != null) {
		if (el.value.value !== inputValue.value) {
			el.value.value = inputValue.value;
		}
	}
})

const handleInput = (e: Event) => {
	const target = e.target as HTMLInputElement;
	const newValue = target.value;

	updateValue(newValue);
	emit('to-next');
}
const updateValue = (value: string | null | undefined) => {
	if (typeof value === 'string' && value.length > 1) {
		value = value.at(-1);
	}
	let newValue: PuzzleValue = '.';
	if (value == null) {
		newValue = '.';
	} else if (isPuzzleSymbol(value)) {
		newValue = value;
	} else if (value.trim() === '' || value === '.') {
		newValue = '.';
	} else {
		console.warn(`Unknown update value: ${value}. Setting to empty.`);
		newValue = '.';
	}
	emit('update:modelValue', newValue);
}

const handleBlur = async (ev: FocusEvent) => {
	const tg = ev.target as HTMLInputElement;
	if (tg.value !== inputValue.value) tg.value = inputValue.value;
}

const handleFocus = (ev: FocusEvent) => {
	const tg = ev.target as HTMLInputElement;
	tg.select();
}

defineExpose({ el });

</script>