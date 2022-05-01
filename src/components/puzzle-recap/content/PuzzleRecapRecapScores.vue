<template>
	<div class="recap-time-stats text-sm px-6 py-4 flex flex-row justify-evenly items-center gap-8 min-w-max w-3/4 max-w-sm mx-auto">
		<div class="min-w-max">
			<div class="mx-auto flex flex-col items-start text-left">
				<div class="text-xs">Best time</div>
				<div class="text-base flex flex-row items-center">
					<span class="text-base">{{formatTime(best)}}</span>
					<span v-if="isTimeRecord" class="line-through decoration-green-500/60 decoration-2 text-gray-600 ml-1 text-xs">{{formatTime(previousBest)}}</span>
				</div>
			</div>
		</div>
		<div class="min-w-max">
			<div class="mx-auto flex flex-col items-start text-left">
			<div class="text-xs">Average</div>
			<div class="text-base">{{formatTime(average)}}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { formatTimeMMSS } from '@/utils/date.utils';
const formatTime = formatTimeMMSS;

const props = defineProps({
	best: {
		type: Number,
		required: true
	},
	average: {
		type: Number,
		required: true
	},
	previousBest: {
		type: Number,
		default: null
	},
})

const isTimeRecord = computed(() => props.previousBest != null && props.best < props.previousBest);
</script>

<style scoped>

</style>