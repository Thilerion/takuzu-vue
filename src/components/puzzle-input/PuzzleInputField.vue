<template>
	<input
		type="text"
		:value="modelValue"
		class="w-full border-0 p-1 m-0 aspect-square h-full text-center"

		@input="handleInputChange"
		@keydown="handleKeydown"
		@keydown.delete="handleCellDelete"
		@focus="handleFocus"
		@blur="handleBlur"

		ref="el"
	>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';

const props = defineProps({
	modelValue: [String, Number],
	index: {
		type: Number,
		required: true
	}
})
const emit = defineEmits(['update:modelValue']);

const el = ref(null);
defineExpose({ el });

const hasCellValue = computed(() => props.modelValue !== '' && props.modelValue !== null);

const handleInputChange = (ev) => {
	emit('update:modelValue', ev.data);
	if (ev.inputType === 'insertText' && (ev.data === '1' || ev.data === '0' || ev.data === ' ' || ev.data === '.')) {
		emit('update:modelValue', ev.data);
		const next = document.querySelector(`[data-index="${props.index + 1}"] input[type="text"]`);
		next?.focus?.();
	}
	
}
const handleKeydown = (ev) => {
	
}
const handleFocus = (ev) => {

}
const handleBlur = (ev) => {
	if (ev.target.value?.length > 1) {
		const value = ev.target.value.at(-1);
		emit('update:modelValue', value);
		ev.target.value = value;
	}
}
const handleCellDelete = (ev) => {
	if (!hasCellValue.value || props.modelValue === ' ') {
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