<template>
	<div class="bg-white text-gray-900 w-full m-auto rounded overflow-hidden">
		<header class="bg-gradient-to-b from-teal-600 to-teal-500 text-white text-center py-3 px-3">
			<div>
				<div class="mb-2 mt-1 inline-block mx-auto">
					<span class="text-2xl">
						{{timeFormatted}}
					</span>
				</div>
			</div>
			<div class="highscore-banner bg-white text-teal-700 text-base inline-flex pr-2 pl-1 rounded-full my-1 font-medium justify-center items-center h-8 leading-none min-w-[13rem]"
				v-if="showRecordMessage"
			><icon-fxemoji-trophy class="mr-2"/>{{recordMessage}}</div>
		</header>
		<div class="inner px-6 pt-4 pb-6 text-sm">
			<div class="text-center flex">
				<div class="overview">
					<div class="overview-item puzzle-type left">
						<div class="overview-label">Puzzle type</div>
						<div class="overview-value">{{dimensions}} - {{difficulty}}*</div>
					</div>

					<div class="overview-item num-solved right">
						<div class="overview-label">Solved</div>
						<div class="overview-value">{{count}}</div>
					</div>

					<div class="overview-item average left">
						<div class="overview-label">Average time</div>
						<div class="overview-value">{{averageFormatted}}</div>
					</div>

					<div class="overview-item best right">
						<div class="overview-label">Best time</div>
						<div class="overview-value"><span class="strikethrough" v-if="isTimeRecord && count > 1">{{previousBestFormatted}}&nbsp;</span>{{bestFormatted}}</div>
					</div>

					<div
						class="stats-recap"
					>
						<div class="highscore-msg"><span v-if="recapMessage">{{recapMessage}}</span></div>
						<button
							class="stats-btn"
							@click="$emit('exit-to', 'statistics')"
						><span class="material-icons"><icon-ic-baseline-leaderboard/></span><span>View all statistics</span></button>
					</div>
				</div>
			</div>
			<div class="recap-btns">
				<BaseButton class="play-again-btn btn-primary w-full" @click="$emit('exit-to', 'play-again')">Play again</BaseButton>
				<div class="secondary-btns flex w-full">
					<BaseButton class="mr-2 text-xs flex-1" @click="$emit('exit-to', 'home')">Home</BaseButton>
					<BaseButton class="text-xs btn-small flex-1" @click="$emit('exit-to', 'new-game')">Change puzzle type</BaseButton>
				</div>				
			</div>
		</div>
	</div>
</template>

<script setup>
import { getRecapMessageType, getRecordMessageData } from '@/services/recap-message';
import { recapMessageMap } from '@/services/recap-message/recap-message.js';
import { useRecapStatsStore } from '@/stores/recap-stats';
import { timeFormatter } from '@/utils/date.utils';
import { storeToRefs } from 'pinia';
import { computed, ref, toRaw, toRefs, watch } from 'vue';
import BaseButton from '../global/BaseButton.vue';

const emit = defineEmits(['exit-to']);

const recapStatsStore = useRecapStatsStore();
const msToMinSec = timeFormatter({ padMinutes: true });

const recapMessageData = ref();
const recordMessageData = ref();
const recapMessage = ref();

const {
	isTimeRecord,
	count,
	currentTimeElapsed, best, previousBest, average, previousAverage
} = storeToRefs(recapStatsStore);

const showRecordMessage = computed(() => recordMessageData.value?.show ?? false);
const recordMessage = computed(() => showRecordMessage.value && recordMessageData.value.message);

const {
	difficulty, width, height
} = toRefs(recapStatsStore.lastPuzzleEntry);

const timeFormatted = computed(() => msToMinSec(currentTimeElapsed.value));
const bestFormatted = computed(() => msToMinSec(best.value));
const previousBestFormatted = computed(() => msToMinSec(previousBest.value));
const averageFormatted = computed(() => msToMinSec(average.value));
const previousAverageFormatted = computed(() => previousAverage.value);
const dimensions = computed(() => `${width.value}x${height.value}`);

const recapStatsInitialized = computed(() => !!recapStatsStore.initialized);

watch(recapStatsInitialized, (value) => {
	console.log('recap stats initialized: ' + value);
	try {
		const result = getRecapMessageType(recapStatsStore);
		if (result) {
			recapMessageData.value = result;
			recordMessageData.value = getRecordMessageData(result, recapStatsStore);
			const type = result.type;
			recapMessage.value = recapMessageMap[type](result.context) ?? '';
		}
	} catch(e) {
		console.warn('Error during generation of recap message.');
		console.error(e);
		recapMessageData.value = null;
		recordMessageData.value = null;
	}
}, { immediate: true });
</script>


<style scoped>
.highscore-banner {
	box-shadow: 0 0 10px 4px rgba(255, 255, 255, 0.6);
}


.overview {
	@apply grid text-center mx-auto mb-6;
	grid-template-rows: 1fr 1fr auto;
	grid-template-columns: auto 1fr 1fr auto;
	grid-template-areas:
		"gl type solved gr"
		"gl average best gr"
		"stats stats stats stats";
	gap: 1rem 2rem;
}

.overview-item {
	@apply w-20;
}

.overview-item.left {
	@apply text-left ml-auto;
}
.overview-item.right {
	@apply text-right ml-auto;
}

.overview-label {
	@apply text-xs opacity-80 text-left;
}
.overview .average {
	grid-area: average;
	@apply text-left;
}
.overview .best {
	grid-area: best;
	@apply text-right ml-auto;
}
.overview .right .overview-value {
	@apply text-left;
}
.overview .num-solved {
	grid-area: solved;
}
.overview .puzzle-type {
	grid-area: type;
}

.overview .stats-recap {
	grid-area: stats;
	@apply border-t border-b pb-3 pt-1 border-gray-200;
}
.highscore-msg {
	@apply text-sm mt-2 mb-1;
}

.overview-value > .strikethrough {
	@apply line-through opacity-60;
}

.stats-btn {
	@apply mx-auto flex w-2/3 justify-center items-center font-medium cursor-pointer py-1 text-gray-700;
}
.stats-btn .material-icons {
	@apply text-base mr-1 opacity-90;
}
.stats-btn > * {
	display: block;
}

.recap-btns {
	@apply w-9/12 flex flex-col justify-center gap-2 items-center mx-auto;
}
</style>