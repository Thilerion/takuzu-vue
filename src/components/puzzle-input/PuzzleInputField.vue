<template>
	<input
		type="text"
		:value="computedInputValue"
		class="w-full border-0 p-1 m-0 aspect-square h-full text-center"

		@input="handleInputChange($event as InputEvent)"
		@keydown="handleKeydown"
		@keydown.delete="handleCellDelete"
		@focus="handleFocus"
		@blur="handleBlur($event as FocusEvent)"
		@paste="handlePaste"

		ref="el"
	>
</template>

<script setup lang="ts">
// TODO: fix types, updating/setting/conversion of (input) values, choose which values are allowed, etc.
import { isExportString } from '@/lib/board/board-conversion.helpers.js';
import { ONE, ZERO, type PuzzleSymbol } from '@/lib/constants';
import { computed, ref } from 'vue';

const props = defineProps<{
	modelValue: string | number,
	index: number
}>();
const emit = defineEmits(['update:modelValue', 'set-multiple', 'import-export-string']);

const computedInputValue = computed((): PuzzleSymbol | '' => {
	const v = props.modelValue;
	if (v === ZERO || v === ONE) return v;
	return '';
})

const el = ref<null | HTMLInputElement>(null);
defineExpose({ el });

const updateInputValue = (str: PuzzleSymbol | ' ' | '' | null | string) => {
	if (str === ZERO || str === ONE) {
		emit('update:modelValue', str);
		el.value!.value = str;
	} else {
		emit('update:modelValue', '');
		el.value!.value = '';
	}
}

const hasCellValue = computed(() => computedInputValue.value !== '' && computedInputValue.value !== null);

const handleInputChange = (ev: InputEvent) => {
	if (typeof ev.data === 'string') {
		if (ev.inputType === 'insertText' && (ev.data === '1' || ev.data === '0' || ev.data === ' ' || ev.data === '.')) {
			const v = ev.data === ' ' ? '' : ev.data === '.' ? '' : ev.data;
			updateInputValue(v);
			const next = document.querySelector(`[data-index="${props.index + 1}"] input[type="text"]`) as HTMLInputElement | null;
			next?.focus?.();
			ev.preventDefault();
			return;
		} else if (ev.inputType === 'insertText') {
			const num = parseInt(ev.data, 10);
			if (!Number.isNaN(num)) {
				emit('set-multiple', [`${num}`]);
			}
		}
		updateInputValue('');
	} else if (ev.inputType?.startsWith?.('delete') && ev.data == null) {
		updateInputValue(null);
	}	
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };
const handleKeydown = noop;
const handleFocus = noop;
const handlePaste = (ev: ClipboardEvent) => {
	const data = ev.clipboardData?.getData('text') ?? '';
	if (data.length === 0) {
		return;
	} else if (isExportString(data)) {
		ev.preventDefault();
		emit('import-export-string', data);
	} else {
		ev.preventDefault();
		emit('set-multiple', data.split(''));		
	}
}
const handleBlur = (ev: FocusEvent) => {
	const tg = ev.target as HTMLInputElement;
	if (tg.value?.length > 1) {
		const value = tg.value.at(-1)!;
		updateInputValue(value);
		tg.value = value;
	}
}
const handleCellDelete = (ev: Event) => {
	updateInputValue('');
	if (!hasCellValue.value) {
		const prev = document.querySelector<HTMLInputElement>(`[data-index="${props.index - 1}"] input[type="text"]`);
		prev?.focus?.();
		if (!hasCellValue.value) {
			ev.preventDefault();
		}
	}
}
</script>

<style scoped>

</style>