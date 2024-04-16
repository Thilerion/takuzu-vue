<template>
	<BaseDropdownItem
		v-if="!currentBoardIsSaved"
		:disabled="!canSaveCurrentBoardStateAsBookmark"
		@click="saveStateAsBookmark"
	>
		<template #icon>
			<icon-ic-outline-bookmark-add class="opacity-80 text-base" />
		</template>
		<span class="mt-px">{{ $t('PlayPuzzle.dd.set-bookmark') }}</span>
	</BaseDropdownItem>
	<BaseDropdownItem
		v-else
		:disabled="!canSaveCurrentBoardStateAsBookmark"
	>
		<template #icon>
			<icon-ic-outline-bookmark-added class="opacity-100 text-green-500 text-base" />
		</template>
		<span class="mt-px">{{ $t('PlayPuzzle.dd.bookmark-saved') }}</span>
	</BaseDropdownItem>

	<BaseDropdownItem
		:disabled="lastBookmark == null || currentBoardIsLastBookmark"
		@click="loadLastBookmark"
	>
		<template #icon>
			<icon-ic-outline-bookmark-border class="opacity-80 text-base" />
		</template>
		<div class="mt-px">
			<div>{{ $t('PlayPuzzle.dd.load-last-bookmark') }}</div>
			<div
				class="flex text-xs opacity-80 h-3"
				v-if="lastBookmark != null"
			>
				<span>{{ lastBookmark.id + 1 }}</span>
				<div class="mx-1">-</div>
				<span>{{ $t('PlayPuzzle.dd.percent-solved', { percentFormatted: $n(lastBookmark.progress, 'percent', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }) }}</span>
				<div class="mx-1">-</div>
				<div>{{ lastBookmark.timerOnSave }}</div>
			</div>
			<div class="text-xs opacity-80 h-3" v-else>{{ $t('PlayPuzzle.dd.no-bookmark-saved') }}</div>
		</div>
	</BaseDropdownItem>

	<BaseDropdownItem
		:disabled="!bookmarks.length"
	>
		<template #icon>
			<icon-ic-outline-bookmarks class="opacity-80 text-base" />
		</template>
		<div class="mt-px">{{ $t('PlayPuzzle.dd.view-bookmarks') }}</div>
	</BaseDropdownItem>
</template>

<script setup lang="ts">
import { usePuzzleBookmarksStore } from '@/stores/bookmarks.js';
import { storeToRefs } from 'pinia';

const emit = defineEmits<{
	(e: 'close'): void
}>();

const bookmarksStore = usePuzzleBookmarksStore();
const {
	saveStateAsBookmark,
	loadBookmark
} = bookmarksStore;
const { 
	canSaveCurrentBoardStateAsBookmark,
	currentBoardIsSaved,
	lastBookmark,
	bookmarks,
	currentBoardIsLastBookmark
} = storeToRefs(bookmarksStore);

const loadLastBookmark = () => {
	if (lastBookmark.value == null) {
		throw new Error('Cannot load last bookmark as there is none.');
	}
	emit('close');
	loadBookmark(lastBookmark.value.id);
}
</script>

<style scoped>

</style>