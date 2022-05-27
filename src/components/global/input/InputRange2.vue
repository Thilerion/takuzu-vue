<template>
	<input
		type="range"
		@input="setTrackBackground"
		:value="modelValue"
		:min="min"
		:max="max"
	>
</template>

<script setup>
import { computed, toRefs } from 'vue';

const props = defineProps({
	modelValue: {
		type: [Number, String],
		required: true
	},
	min: {
		type: [Number, String],
		default: 0
	},
	max: {
		type: [Number, String],
		default: 100
	},
})
const { modelValue, min, max } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'input']);

const rangePercentage = computed(() => {
	const value = modelValue.value * 1;
	const minInt = min.value * 1;
	const maxInt = max.value * 1;
	return (value - minInt) / (maxInt - minInt);
})
const setTrackBackground = (ev) => {
	emit('update:modelValue', ev.target.value);
	emit('input', ev);
}
</script>

<style scoped>
input[type="range"]::-webkit-slider-runnable-track {
	background-image: linear-gradient(theme(colors.teal.500), theme(colors.teal.500));
	background-repeat: no-repeat;
	background-size: calc(v-bind(rangePercentage) * 100%) 100%;
}
input[type="range"]::-moz-range-track {
	background-image: linear-gradient(theme(colors.teal.500), theme(colors.teal.500));
	background-repeat: no-repeat;
	background-size: calc(v-bind(rangePercentage) * 100%) 100%;
}
</style>