<template>
	<BaseButton class="flex flex-col px-2 text-center justify-around items-center w-full continue-btn">
		<div class="uppercase text-base mt-auto">Continue</div>
		<div class="flex text-xs justify-center gap-4 w-full flex-initial leading-relaxed items-center">
			<span>{{dimensions}} - {{diffLabel}}</span>
			<div class="flex items-center justify-start"><icon-uil-clock class="inline-block mr-1" />{{time}}</div>
		</div>
	</BaseButton>
</template>

<script setup>
import { DIFFICULTY_LABELS } from '@/config';
import { timeFormatter } from '@/utils/date.utils.js';
import { computed } from 'vue';

const props = defineProps({
	width: {
		required: true,
		type: Number
	},
	height: {
		required: true,
		type: Number
	},
	difficulty: {
		required: true,
		type: Number
	},
	timeElapsed: {
		required: true,
		type: Number
	}
});

const diffLabel = computed(() => {
	return DIFFICULTY_LABELS[props.difficulty];
})
const time = computed(() => {
	return timeFormatter({
		padMinutes: true
	})(props.timeElapsed)
})

const dimensions = computed(() => {
	return `${props.width}x${props.height}`;
})

</script>

<style scoped>
.continue-btn {
	@apply pb-1 pt-2;
}
</style>