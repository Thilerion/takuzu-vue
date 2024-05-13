<template>
<div class="bg-white dark:bg-slate-800 px-4 pt-3 text-sm flex flex-col w-full">
	<div class="flex flex-row items-center justify-between min-h-6">
		<div class="text-gray-500 dark:text-slate-100">{{ $d(date, 'long') }}</div>
		<div class="flex flex-row">
			<IconBtn
				class="text-xs text-gray-500 dark:text-slate-400"
				scale="1"
				@click="isEditing = !isEditing"
			>
				<icon-mdi-pencil />
			</IconBtn>
			<IconBtn
				class="text-xs text-gray-500 dark:text-slate-400"
				scale="1"
				@click="replayPuzzle"
			><icon-icon-park-replay-music class="icon-stroke-current" /></IconBtn>
			<IconBtn
				v-if="mainStore.debugMode"
				class="text-xs text-gray-500 dark:text-slate-400"
				scale="1"
				@click="deleteItem"
			><icon-ic-outline-delete-forever /></IconBtn>
			<IconBtn
				class="text-xs"
				scale="1"
				@click="toggleFavorite"
			>
				<StarIcon
					:class="{ 'text-gray-400 dark:text-slate-500': !isFavorite }"
					:filled="isFavorite"
					:gray="!isFavorite"
				/>
			</IconBtn>
		</div>
	</div>
	<div class="flex flex-row gap-6 justify-start last-of-type:pb-3">
		<div class="flex flex-col w-1/4">
			<div class="text-sm text-gray-600 dark:text-slate-300">Size</div>
			<div class="text-lg text-black dark:text-slate-100">{{ dimensions }}</div>
		</div>
		<div class="flex flex-col w-1/4">
			<div class="text-sm text-gray-600 dark:text-slate-300">Difficulty</div>
			<div class="text-lg text-black dark:text-slate-100">{{ difficulty }}*</div>
		</div>
		<div class="flex flex-col w-1/3">
			<div class="text-sm text-gray-600 dark:text-slate-300">Time</div>
			<div class="text-lg text-black dark:text-slate-100">
				{{ timeElapsedFormatted.minsec }}<small class="opacity-80">.{{ timeElapsedFormatted.ms }}</small></div>
		</div>
	</div>
	<div v-if="recordAll" class="inline-flex flex-row mb-2 text-xs mt-1 items-center bg-gray-100 dark:bg-slate-700 dark:text-slate-50 rounded-full mr-auto px-4 py-2">
		<icon-fxemoji-trophy class="text-xs" />
		<div v-if="currentTimeRecord" class="ml-1">Current time record!</div>
		<div v-else-if="firstTimeRecord" class="ml-1">First time solved</div>
		<div v-else-if="previousTimeRecord" class="ml-1">Previous time record</div>
	</div>
	<HistoryListPuzzleItemNote
		:id="props.item.id!"
		v-model:editing="isEditing"
		:note="item.note"
	/>
	<div class="h-2"></div>
</div>
</template>

<script setup lang="ts">
import { formatDurationMMSSss } from '@/utils/duration.utils';
import { computed, nextTick, ref, watch } from 'vue';
import { toRefs } from '@vueuse/core';
import type { StatsDbExtendedStatisticDataEntry } from '@/services/db/stats-db/models.js';
import { useStatisticsNextStore } from '../../store.js';
import { useMainStore } from '@/stores/main.js';
import { useRouter } from 'vue-router';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { awaitTimeout } from '@/utils/delay.utils.js';

type HistoryListItemProps = {
	item: StatsDbExtendedStatisticDataEntry;
	recordFirst: boolean;
	recordCurrent: boolean;
	recordAll: boolean;
}
const props = defineProps<HistoryListItemProps>();
const emit = defineEmits<{
	favorite: [val: boolean],
	delete: [],
	'save-note': [note: string | undefined]
}>();
const { difficulty, dimensions, date, timeElapsed, width, height } = toRefs(props.item);
const mainStore = useMainStore();

const currentTimeRecord = computed(() => props.recordCurrent && !props.recordFirst);
const firstTimeRecord = computed(() => props.recordFirst);
const previousTimeRecord = computed(() => props.recordAll && !props.recordFirst && !props.recordCurrent);

const formatTime = (ms: number) => formatDurationMMSSss(ms, { padFirst: true });
const timeElapsedFormatted = computed(() => {
	const timeStr = formatTime(timeElapsed.value);
	const [minsec, ms] = timeStr.split('.');
	return {minsec, ms};
})

const statsNextStore = useStatisticsNextStore();

const isEditing = ref(false);

const favoriteFlag = computed(() => !!(props.item?.flags?.favorite));
const tempIsFavorite = ref<boolean | null>(favoriteFlag.value);
const isFavorite = computed(() => {
	if (tempIsFavorite.value != null) {
		return tempIsFavorite.value;
	}
	return favoriteFlag.value;
})
const toggleFavorite = async () => {
	tempIsFavorite.value = !tempIsFavorite.value;
	await statsNextStore.toggleFavorite(props.item.id!, tempIsFavorite.value);
	await nextTick();
	tempIsFavorite.value = favoriteFlag.value;
}
watch(favoriteFlag, () => {
	tempIsFavorite.value = null;
})

function deleteItem() {
	// TODO: replace confirm dialog with modal
	const confirmed = window.confirm('Are you sure? Deleting this history entry can not be undone!');
	if (!confirmed) return;

	statsNextStore.deleteItem(props.item.id!);
}

const puzzleConfig = computed(() => {
	return { width: width.value, height: height.value, difficulty: difficulty.value };
})
const router = useRouter();
const goToPlayPuzzleRoute = () => router.push({ name: 'PlayPuzzle' });
async function replayPuzzle() {
	// TODO: SET REPLAY_MODE IN ROUTE, so game board header knows this, etc
	const boardStrings = {
		board: props.item.initialBoard,
		solution: props.item.solution
	};
	const puzzleStore = usePuzzleStore();
	puzzleStore.replayPuzzle({ puzzleConfig: puzzleConfig.value, boardStrings });
	await awaitTimeout(1000 / 60 * 2);
	goToPlayPuzzleRoute();
}
</script>

<style scoped>
::v-deep(.icon-stroke-current > *) {
	stroke: currentColor;
}
</style>
