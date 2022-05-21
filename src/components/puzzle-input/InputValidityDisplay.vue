<template>
<div class="">
	<div class="flex flex-row justify-around px-1 transition-opacity duration-300 delay-150 gap-x-2 max-w-md mx-auto" :class="{'opacity-30': !validInput}">
		<div
			class="flex flex-row px-4 rounded h-6 items-center leading-none text-xs transition-colors delay-150 duration-300 gap-x-4 w-fit whitespace-nowrap"
			:class="{
				'bg-red-200 text-red-900': solutions === 0,
				'bg-green-100 text-green-900': solutions === 1
			}"
		>
			<div class="">Solutions</div>
			<div>{{props.solutions}}{{props.solutions > 1 ? '+' : ''}}</div>
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
import { get } from '@vueuse/core';
import { computed } from 'vue';
import { asPercentage } from '@/utils/number.utils';

const props = defineProps({
	solutions: {
		type: Number,
		required: true
	},
	validInput: Boolean,
	validPuzzle: Boolean,
	maskRatio: Number,
	solvable: Boolean
})

const stringifiedProps = computed(() => {
	const obj = {};
	for (const [key, value] of Object.entries(props)) {
		const rawValue = get(value);
		obj[key] = rawValue;
	}
	const str = JSON.stringify(obj, undefined, 4);
	return str;
})
</script>

<style scoped>

</style>