<template>
	<div
		class="bg-white px-4 pt-3 text-sm flex flex-col w-full"
	>
		<div class="flex flex-row items-center justify-between">
			<div class="text-gray-500">{{dateFormatted}}</div>
			<div class="flex flex-row">
				<IconBtn
					class="text-xs text-gray-500"
					scale="1"
					@click="editNote"
				>
					<icon-mdi-pencil />
				</IconBtn>
				<IconBtn
					class="text-xs"
					scale="1"
					@click="replayPuzzle"
				><icon-icon-park-replay-music class="text-gray-500 icon-stroke-current" /></IconBtn>
				<IconBtn
					v-if="canDelete"
					class="text-xs"
					@click="initDeleteItem"
					scale="1"
				><icon-ic-outline-delete-forever class="text-gray-500" /></IconBtn>
				<IconBtn
					@click="toggleFavorite"
					class="text-xs"
					scale="1"
				><StarIcon :class="{ 'text-gray-400': !isFavorite }" :filled="isFavorite" :gray="!isFavorite" /></IconBtn>
			</div>
		</div>
		<div class="flex flex-row gap-6 justify-start last-of-type:pb-3">
			<div class="flex flex-col w-1/4">
				<div class="text-sm text-gray-600">Size</div>
				<div class="text-lg text-black">{{dimensions}}</div>
			</div>
			<div class="flex flex-col w-1/4">
				<div class="text-sm text-gray-600">Difficulty</div>
				<div class="text-lg text-black">{{difficulty}}*</div>
			</div>
			<div class="flex flex-col w-1/3">
				<div class="text-sm text-gray-600">Time</div>
				<div class="text-lg text-black">{{timeElapsedFormatted.minsec}}<small
					class="opacity-80"
				>.{{timeElapsedFormatted.ms}}</small></div>
			</div>
		</div>
		<div v-if="timeRecord" class="inline-flex flex-row mb-2 text-xs mt-1 items-center bg-gray-100 rounded-full mr-auto px-4 py-2">
			<icon-fxemoji-trophy class="text-xs" />
			<div class="ml-1" v-if="currentTimeRecord">Current time record!</div>
			<div class="ml-1" v-else-if="firstTimeRecord">First time solved</div>
			<div class="ml-1" v-else-if="previousTimeRecord">Previous time record</div>
		</div>
		<HistoryListItemNote
			:note="note"
			:id="props.id"
			@save-note="(note) => $emit('save-note', note)"
		/>
		<div class="h-2"></div>
	</div>
</template>

<script setup lang="ts">


import { useMainStore } from '@/stores/main';
import { usePuzzleStore } from '@/stores/puzzle';
import { formatDurationMMSSss } from '@/utils/duration.utils';
import { useRouter } from 'vue-router';
import type { PuzzleStatisticData } from '@/services/stats/db/models';
import { toRefs } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';
import { useStatisticsStore } from '@/stores/statistics.js';
import { awaitTimeout } from '@/utils/delay.utils.js';

defineOptions({
	inheritAttrs: false
})

const formatTime = (ms: number) => formatDurationMMSSss(ms, { padFirst: true });

const dateTimeOpts: Intl.DateTimeFormatOptions = {
	weekday: 'short',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric'
}
const formatDate = (date: Date) => date.toLocaleString(undefined, dateTimeOpts);

const props = defineProps<PuzzleStatisticData & { timeRecord: null | { current: boolean, first: boolean } }>();
const emit = defineEmits<{
	favorite: [val: boolean],
	delete: [],
	'save-note': [note: string | undefined]
}>();
const { difficulty, dimensions, flags, date, timeElapsed, width, height } = toRefs(props);

const currentTimeRecord = computed(() => !!props.timeRecord?.current);
const firstTimeRecord = computed(() => !!props.timeRecord?.first);
const previousTimeRecord = computed(() => !!props.timeRecord && !currentTimeRecord.value && !firstTimeRecord.value);

const forcedFavorite = ref<null | boolean>(null);
const isFavorite = computed(() => {
	if (forcedFavorite.value != null) return forcedFavorite.value;
	const favFlag = flags.value?.favorite;
	return !!favFlag;
})
const toggleFavorite = () => {
	const value = isFavorite.value ? !isFavorite.value : !forcedFavorite.value;
	forcedFavorite.value = value;

	emit('favorite', value);
}
const statsStore = useStatisticsStore();
const editNote = () => {
	statsStore.editingNoteId = props.id ?? null;
}

const dateFormatted = computed(() => {
	return formatDate(date.value);
})
const timeElapsedFormatted = computed(() => {
	const timeStr = formatTime(timeElapsed.value);
	const [minsec, ms] = timeStr.split('.');
	return {minsec, ms};
})

const mainStore = useMainStore();
const canDelete = computed(() => {
	return mainStore.debugMode;
})

const initDeleteItem = () => {
	const confirmed = window.confirm('Are you sure? Deleting this history entry can not be undone!');
	if (!confirmed) return;

	emit('delete');
}

const puzzleConfig = computed(() => {
	return { width: width.value, height: height.value, difficulty: difficulty.value };
})
const router = useRouter();
const goToPlayPuzzleRoute = () => router.push({ name: 'PlayPuzzle'});
async function replayPuzzle() {
	// TODO: SET REPLAY_MODE IN ROUTE, so game board header knows this, etc
	const boardStrings = {
		board: props.initialBoard,
		solution: props.solution
	};
	const puzzleStore = usePuzzleStore();
	await puzzleStore.replayPuzzle({ puzzleConfig: puzzleConfig.value, boardStrings });
	await awaitTimeout(1000 / 60 * 2);
	goToPlayPuzzleRoute();
}
</script>

<style scoped>
::v-deep(.icon-stroke-current > *) {
	stroke: currentColor;
}
</style>