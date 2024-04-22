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
	min?: number | string,
	max?: number | string
}>(), {
	min: 0,
	max: 100
});


const { modelValue, min, max } = toRefs(props);

const propAsInt = (val: number | string): number => {
	if (typeof val === 'string') {
		const num = parseInt(val, 10);
		if (Number.isNaN(num)) throw new Error('Prop as string cannot be parsed as number');
		return num;
	}
	return val;
}
const minInt = computed(() => propAsInt(props.min));
const maxInt = computed(() => propAsInt(props.max));
const mvAsNumber = computed(() => typeof modelValue.value === 'number' ? modelValue.value : Number(modelValue.value));

const emit = defineEmits(['update:modelValue', 'input']);

const rangePercentage = computed(() => {
	const value = mvAsNumber.value;
	return (value - minInt.value) / (maxInt.value - minInt.value);
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