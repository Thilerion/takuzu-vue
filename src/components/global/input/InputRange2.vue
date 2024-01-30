<template>
	<input
		type="range"
		@input="(ev) => setTrackBackground(ev as InputEvent)"
		:value="modelValue"
		:min="min"
		:max="max"
	>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';

const props = withDefaults(defineProps<{
	modelValue: number | string,
	min?: number,
	max?: number
}>(), {
	min: 0,
	max: 100
});

const { modelValue, min, max } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'input']);

const mvAsNumber = computed(() => typeof modelValue.value === 'number' ? modelValue.value : Number(modelValue.value));

const rangePercentage = computed(() => {
	const value = mvAsNumber.value;
	const minInt = min.value * 1;
	const maxInt = max.value * 1;
	return (value - minInt) / (maxInt - minInt);
})
const setTrackBackground = (ev: InputEvent) => {
	emit('update:modelValue', (ev.target as HTMLInputElement).value); // or valueAsNumber?
	emit('input', ev);
}
</script>

<style scoped>
input[type="range"]::-webkit-slider-runnable-track {
	background-image: linear-gradient(theme('colors.teal.500'), theme('colors.teal.500'));
	background-repeat: no-repeat;
	background-size: calc(v-bind(rangePercentage) * 100%) 100%;
}
input[type="range"]::-moz-range-track {
	background-image: linear-gradient(theme('colors.teal.500'), theme('colors.teal.500'));
	background-repeat: no-repeat;
	background-size: calc(v-bind(rangePercentage) * 100%) 100%;
}
</style>