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
	:disabled="previousBookmark == null"
	@click="loadPreviousBookmark"
>
	<template #icon>
		<icon-ic-outline-bookmark-border class="opacity-80 text-base" />
	</template>
	<div class="mt-px">
		<div>{{ $t('PlayPuzzle.dd.load-previous-bookmark') }}</div>
		<div
			v-if="previousBookmark == null"
			class="text-xs opacity-80 h-3"
		>
			<span v-if="bookmarks.length > 0">{{ $t('PlayPuzzle.dd.previous-bookmark-is-current') }}</span>
			<span v-else>{{ $t('PlayPuzzle.dd.no-bookmark-saved') }}</span>
		</div>
		<div
			v-else
			class="flex text-xs opacity-80 h-3"
		>
			<span>{{ previousBookmark.id + 1 }}</span>
			<div class="mx-1">-</div>
			<span>{{ $t('PlayPuzzle.dd.percent-solved', { percentFormatted: $n(previousBookmark.progress, 'percent', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }) }}</span>
			<div class="mx-1">-</div>
			<div>{{ formatDurationHHMMSS(previousBookmark.timerOnSave, { emptyHours: false, padFirst: false }) }}</div>
		</div>
	</div>
</BaseDropdownItem>

<BaseDropdownItem
	:disabled="!bookmarks.length"
	@click="openBookmarkManagerModal"
>
	<template #icon>
		<icon-ic-outline-bookmarks class="opacity-80 text-base" />
	</template>
	<div class="mt-px">{{ $t('PlayPuzzle.dd.view-bookmarks') }}</div>
</BaseDropdownItem>

<GameBoardBookmarkManager
	v-model="bookmarkManagerOpened"
/>
</template>

<script setup lang="ts">
import { usePuzzleBookmarksStore } from '@/stores/bookmarks.js';
import { formatDurationHHMMSS } from '@/utils/duration.utils.js';
import { storeToRefs } from 'pinia';
import { watch, ref } from 'vue';

const emit = defineEmits<{
	(e: 'close-dropdown'): void,
	(e: 'toggle-bookmark-manager', value: boolean): void,
}>();

const bookmarksStore = usePuzzleBookmarksStore();
const {
	saveStateAsBookmark,
	loadBookmark
} = bookmarksStore;
const { 
	canSaveCurrentBoardStateAsBookmark,
	currentBoardIsSaved,
	previousBookmark,
	bookmarks,
} = storeToRefs(bookmarksStore);

const loadPreviousBookmark = () => {
	if (previousBookmark.value == null) {
		throw new Error('Cannot load previous bookmark as there is none.');
	}
	emit('close-dropdown');
	loadBookmark(previousBookmark.value.id);
}

const bookmarkManagerOpened = ref(false);
const openBookmarkManagerModal = () => {
	bookmarkManagerOpened.value = true;
}
watch(bookmarkManagerOpened, (val) => {
	// if opening the bookmark modal, close the dropdown
	// note: puzzle should remain paused!
	if (val) {
		emit('close-dropdown');
		emit('toggle-bookmark-manager', true);
	} else if (!val) {
		emit('toggle-bookmark-manager', false);
	}
})
</script>