<template>
	<input
		type="text"
		:value="inputValue"
		class="w-full border-0 p-1 m-0 aspect-square h-full text-center"

		@input="handleInputChange"
		@keydown="handleKeydown"
		@keydown.delete="handleCellDelete"
		@focus="handleFocus"
		@blur="handleBlur"
		@paste="handlePaste"

		ref="el"
	>
</template>

<script setup>
import { isExportString } from '@/lib/board/Board.helpers.js';
import { ONE, ZERO } from '@/lib/constants';
import { computed, ref, toRef } from 'vue';

const props = defineProps({
	modelValue: [String, Number],
	index: {
		type: Number,
		required: true
	}
})
const mv = toRef(props, 'modelValue');
const emit = defineEmits(['update:modelValue', 'skip-focus', 'set-multiple', 'import-export-string']);
const inputValue = computed({
	get() {
		const v = mv.value;
		if (v === ZERO || v === ONE) return v;
		return '';
	},
	set(value) {
		if (value === ZERO || value === ONE) {
			emit('update:modelValue', value);
			el.value.value = value;
		} else if (value === null || value === ' ' || value === '') {
			emit('update:modelValue', '');
			el.value.value = null;
		} else {
			emit('update:modelValue', '');
			el.value.value = null;
		}
	}
})

const el = ref(null);
defineExpose({ el });

const hasCellValue = computed(() => inputValue.value !== '' && inputValue.value !== null);

const handleInputChange = (ev) => {
	if (typeof ev.data === 'string') {
		if (ev.inputType === 'insertText' && (ev.data === '1' || ev.data === '0' || ev.data === ' ' || ev.data === '.')) {
			inputValue.value = ev.data;
			const next = document.querySelector(`[data-index="${props.index + 1}"] input[type="text"]`);
			next?.focus?.();
			ev.preventDefault();
			return;
		} else if (ev.inputType === 'insertText') {
			const num = parseInt(ev.data, 10);
			if (!Number.isNaN(num)) {
				emit('set-multiple', [`${num}`]);
			}
		}
		inputValue.value = '';
	} else if (ev.inputType?.startsWith?.('delete') && ev.data == null) {
		inputValue.value = null;
	}	
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };
const handleKeydown = noop;
const handleFocus = noop;
const handlePaste = (ev) => {
	const data = (ev.clipboardData ?? window.clipboardData)?.getData('text') ?? '';
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
const handleBlur = (ev) => {
	if (ev.target.value?.length > 1) {
		const value = ev.target.value.at(-1);
		inputValue.value = value;
		ev.target.value = value;
	}
}
const handleCellDelete = (ev) => {
	inputValue.value = '';
	if (!hasCellValue.value || inputValue.value === ' ') {
		const prev = document.querySelector(`[data-index="${props.index - 1}"] input[type="text"]`);
		prev?.focus?.();
		if (!hasCellValue.value) {
			ev.preventDefault();
		}
	}
}
</script>

<style scoped>

</style>