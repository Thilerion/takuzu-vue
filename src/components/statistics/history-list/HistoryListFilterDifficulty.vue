<template>
	<div class="inline-grid gap-x-3 gap-y-1">
		<label class="col-start-1 row-start-1" for="difficultyFilterMin">Min</label>
		<input class="col-start-1 row-start-2"  min="1" :max="Math.min(maxValue, 5)" type="number" id="difficultyFilterMin" :value="minValue" @blur="setMinValue">

		<label class="col-start-3 row-start-1" for="difficultyFilterMax">Max</label>
		<input max="5" class="col-start-3 row-start-2" :min="Math.max(minValue, 1)" type="number" id="difficultyFilterMax" :value="maxValue" @blur="setMaxValue">
		
		<div class="col-start-2 row-start-2 self-center mx-auto px-2">-</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	modelValue: {
		validator(value) {
			return Array.isArray(value) && value.length === 2 && value[0] <= value[1];
		},
		required: true
	}
})
const emit = defineEmits(['update:modelValue']);

const minValue = computed(() => {
	return props.modelValue[0];
})
const maxValue = computed(() => {
	return props.modelValue[1];
})

const emitUpdateValue = ([min, max]) => {
	emit('update:modelValue', [
		Math.max(1, min),
		Math.min(max, 5)
	]);
}

const setMinValue = (ev) => {
	const min = ev.target.value * 1;
	const max = maxValue.value;
	const range = [min > max ? max : min, max];
	emitUpdateValue(range);
}
const setMaxValue = (ev) => {
	const max = ev.target.value * 1;
	const min = minValue.value;
	const range = [min, max < min ? min : max];
	emitUpdateValue(range);
}
</script>

<style scoped>

</style>