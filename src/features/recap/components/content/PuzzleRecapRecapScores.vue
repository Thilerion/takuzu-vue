<template>
<div class="recap-time-stats text-sm px-6 py-4 flex flex-row justify-evenly items-center gap-8 min-w-max w-3/4 max-w-sm mx-auto">
	<div class="min-w-max">
		<div class="mx-auto flex flex-col items-start text-left">
			<div class="text-xs">{{ $t('Recap.time-best') }}</div>
			<div class="text-base flex flex-row items-center">
				<span v-if="best !== 0 && best != null" class="text-base">{{ formatTime(best) }}</span>
				<div v-else class="text-base tracking-widest">--:--</div>
				<span v-if="isTimeRecord" class="line-through decoration-green-500/60 decoration-2 text-gray-600 ml-1 text-xs">{{ formatTime(previousBest ?? 0) }}</span>
			</div>
		</div>
	</div>
	<div class="min-w-max">
		<div class="mx-auto flex flex-col items-start text-left">
			<div class="text-xs">{{ $t('Recap.time-average') }}</div>
			<div v-if="average !== 0 && average != null" class="text-base">{{ formatTime(average) }}</div>
			<div v-else class="text-base tracking-widest">--:--</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { formatTimeMMSSWithRounding } from '@/utils/time.utils';
const formatTime = formatTimeMMSSWithRounding(200);

export type RecapScoresDataProp = {
	best: number,
	average: number,
	previousBest: number | null
}

const props = defineProps<{
	data: RecapScoresDataProp | null
}>();

const previousBest = computed(() => props.data?.previousBest);
const average = computed(() => props.data?.average);
const best = computed(() => props.data?.best);

const isTimeRecord = computed(() => previousBest.value != null && best.value != null && best.value < previousBest.value);
</script>