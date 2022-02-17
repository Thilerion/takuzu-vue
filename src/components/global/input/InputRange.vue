<template>
	<input
		type="range"
		:id="id"
		:min="min"
		:max="max"
		:step="step"
		:value="value"
		class="range-input"
		@input="$emit('update:modelValue', $event.target.value)"
	>
</template>

<script setup>
import { toRef, toRefs } from 'vue';

const props = defineProps({
	id: {
		type: String,
		required: true
	},
	min: [Number, String],
	max: [Number, String],
	step: [Number, String],
	modelValue: [Number, String],
})

const { min, max, step } = toRefs(props);
const value = toRef(props, 'modelValue');

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
	
</style>