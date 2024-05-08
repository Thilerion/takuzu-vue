<template>
<div class="bg-white dark:bg-slate-800 px-4 pt-3 text-sm flex flex-col w-full">
	<div class="flex flex-row items-center justify-between min-h-6">
		<div class="text-gray-500 dark:text-slate-100">{{ $d(date, 'long') }}</div>
		<div class="flex flex-row">
			<IconBtn
				class="text-xs text-gray-500"
				scale="1"
				@click="startEditing(item.id!)"
			>
				<icon-mdi-pencil />
			</IconBtn>
			<!-- <IconBtn
				class="text-xs"
				scale="1"
				@click="replayPuzzle"
			><icon-icon-park-replay-music class="text-gray-500 icon-stroke-current" /></IconBtn>
			<IconBtn
				v-if="canDelete"
				class="text-xs"
				scale="1"
				@click="initDeleteItem"
			><icon-ic-outline-delete-forever class="text-gray-500" /></IconBtn>
			<IconBtn
				class="text-xs"
				scale="1"
				@click="toggleFavorite"
			>
				<StarIcon
					:class="{ 'text-gray-400': !isFavorite }"
					:filled="isFavorite"
					:gray="!isFavorite"
				/>
			</IconBtn> -->
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
		:note="item.note"
	/>
	<div class="h-2"></div>
</div>
</template>

<script setup lang="ts">
import { formatDurationMMSSss } from '@/utils/duration.utils';
import { computed } from 'vue';
import { toRefs } from '@vueuse/core';
import type { StatsDbExtendedStatisticDataEntry } from '@/services/db/stats-db/models.js';
import { useNoteEditing } from '../../composables/note-editing.js';

const formatTime = (ms: number) => formatDurationMMSSss(ms, { padFirst: true });

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
const { difficulty, dimensions, date, timeElapsed } = toRefs(props.item);

const currentTimeRecord = computed(() => props.recordCurrent && !props.recordFirst);
const firstTimeRecord = computed(() => props.recordFirst);
const previousTimeRecord = computed(() => props.recordAll && !props.recordFirst && !props.recordCurrent);

const timeElapsedFormatted = computed(() => {
	const timeStr = formatTime(timeElapsed.value);
	const [minsec, ms] = timeStr.split('.');
	return {minsec, ms};
})

const {
	startEditing,
} = useNoteEditing();
</script>

<style scoped>
::v-deep(.icon-stroke-current > *) {
	stroke: currentColor;
}
</style>