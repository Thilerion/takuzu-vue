<template>
<div class="">
	<div class="flex flex-row justify-around px-1 transition-opacity duration-300 delay-150 gap-x-2 max-w-md mx-auto" :class="{'opacity-30': !isRunning}">
		<div
			class="flex flex-row px-4 rounded h-6 items-center leading-none text-xs transition-colors delay-150 duration-300 gap-x-4 w-fit whitespace-nowrap"
			:class="{
				'bg-red-200 text-red-900': solutions === 0,
				'bg-green-100 text-green-900': solutions === 1
			}"
		>
			<div class="">Solutions</div>
			<div>{{displayNumSolutions}}</div>
		</div>
		<div
			class="flex flex-row px-4 rounded h-6 items-center leading-none text-xs gap-x-4 w-fit whitespace-nowrap"
		>
			<div class="">Mask ratio</div>
			<div>{{asPercentage(props.maskRatio ?? 1)}}</div>
		</div>
	</div>
</div>
	
</template>

<script setup>
import { computed } from 'vue';
import { asPercentage } from '@/utils/number.utils';

const props = defineProps({
	solutions: {
		required: true,
		validator(value) {
			return (typeof value === 'number') || value === null;
		}
	},
	validInput: Boolean,
	validPuzzle: Boolean,
	maskRatio: Number,
	solvable: Boolean,
	maxSolutions: Number
})

const isRunning = computed(() => {
	return props.validInput && props.solutions != null;
})

const displayNumSolutions = computed(() => {
	if (props.solutions >= props.maxSolutions) {
		return `${props.solutions}+`;
	} else if (props.solutions == null || props.solutions == Infinity) {
		return `${props.maxSolutions}+`;
	} else return `${props.solutions}`;
})
</script>

<style scoped>

</style>