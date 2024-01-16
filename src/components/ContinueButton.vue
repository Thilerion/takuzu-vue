<template>
	<BaseButton class="flex flex-col px-2 text-center justify-around items-center w-full continue-btn">
		<div class="uppercase text-base mt-auto">Continue</div>
		<div class="flex text-xs justify-center gap-4 w-full flex-initial leading-relaxed items-center">
			<span>{{dimensions}} - {{diffLabel}}</span>
			<div class="flex items-center justify-start"><icon-uil-clock class="inline-block mr-1" />{{time}}</div>
		</div>
	</BaseButton>
</template>

<script setup lang="ts">
import { DIFFICULTY_LABELS } from '@/config';
import { timeFormatter } from '@/utils/date.utils';
import { computed } from 'vue';
import type { DifficultyKey, DimensionStr } from '@/lib/types';

export interface Props {
	timeElapsed: number,
	width: number,
	height: number,
	difficulty: DifficultyKey
}

const props = defineProps<Props>();

const diffLabel = computed<string>(() => {
	return DIFFICULTY_LABELS[props.difficulty];
})
const time = computed(() => {
	return timeFormatter({
		padMinutes: true
	})(props.timeElapsed)
})
const dimensions = computed<DimensionStr>(() => {
	return `${props.width}x${props.height}`;
})

</script>

<style scoped>
.continue-btn {
	@apply pb-1 pt-2;
}
</style>