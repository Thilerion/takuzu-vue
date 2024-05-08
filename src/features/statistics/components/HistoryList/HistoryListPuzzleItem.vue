<template>
<div class="bg-white px-4 pt-3 text-sm flex flex-col w-full">
	<div class="flex flex-row items-center justify-between min-h-6">
		<div class="text-gray-500">{{ dateFormatted }}</div>
		<div class="flex flex-row">
			<!-- <IconBtn
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
			<div class="text-sm text-gray-600">Size</div>
			<div class="text-lg text-black">{{ dimensions }}</div>
		</div>
		<div class="flex flex-col w-1/4">
			<div class="text-sm text-gray-600">Difficulty</div>
			<div class="text-lg text-black">{{ difficulty }}*</div>
		</div>
		<div class="flex flex-col w-1/3">
			<div class="text-sm text-gray-600">Time</div>
			<div class="text-lg text-black">
				{{ timeElapsedFormatted.minsec }}<small class="opacity-80">.{{ timeElapsedFormatted.ms }}</small></div>
		</div>
	</div>
	<div v-if="recordAll" class="inline-flex flex-row mb-2 text-xs mt-1 items-center bg-gray-100 rounded-full mr-auto px-4 py-2">
		<icon-fxemoji-trophy class="text-xs" />
		<div v-if="currentTimeRecord" class="ml-1">Current time record!</div>
		<div v-else-if="firstTimeRecord" class="ml-1">First time solved</div>
		<div v-else-if="previousTimeRecord" class="ml-1">Previous time record</div>
	</div>
	<HistoryListItemNote
		:id="props.item.id"
		:note="item.note"
		@save-note="(note) => $emit('save-note', note)"
	/>
	<div class="h-2"></div>
</div>
</template>

<script setup lang="ts">
import { formatDurationMMSSss } from '@/utils/duration.utils';
import { computed } from 'vue';
import { toRefs } from '@vueuse/core';
import type { StatsDbExtendedStatisticDataEntry } from '@/services/db/stats-db/models.js';

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

const dateFormatted = computed(() => {
	return formatDate(date.value);
})
const timeElapsedFormatted = computed(() => {
	const timeStr = formatTime(timeElapsed.value);
	const [minsec, ms] = timeStr.split('.');
	return {minsec, ms};
})
</script>

<style scoped>
::v-deep(.icon-stroke-current > *) {
	stroke: currentColor;
}
</style>