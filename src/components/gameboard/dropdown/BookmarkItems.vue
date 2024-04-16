<template>
	<BaseDropdownItem :disabled="!canSaveCurrentBoardStateAsBookmark" @click="saveStateAsBookmark">
				<template #icon>
					<icon-ic-outline-bookmark-added class="opacity-100 text-green-500 text-base" v-if="currentBoardIsSaved" />
					<icon-ic-outline-bookmark-add class="opacity-80 text-base" v-else />
				</template>
				<template #default>
					<span class="mt-px" v-if="currentBoardIsSaved">{{ $t('PlayPuzzle.dd.bookmark-saved') }}</span>
					<span class="mt-px" v-else>{{ $t('PlayPuzzle.dd.set-bookmark') }}</span>
				</template>
			</BaseDropdownItem>
			<BaseDropdownItem
				v-for="bm in bookmarks"
				:key="bm.id"
			>
				<template #icon>
					<icon-ic-outline-bookmark-border class="opacity-80 text-base" />
				</template>
				<div class="mt-px">
					<div>{{ $t('PlayPuzzle.dd.load-bookmark', { id: bm.id + 1 }) }}</div>
					<div class="flex text-xs opacity-80">
						<div>{{  $t('PlayPuzzle.dd.percent-solved', { percentFormatted: $n(bm.progress, 'percent', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }) }}</div>
						<div class="mx-1">-</div>
						<div>{{ bm.timerOnSave }}</div>
					</div>
				</div>
			</BaseDropdownItem>
			<BaseDropdownItem disabled>
				<template #icon>
					<icon-ic-outline-bookmark-remove class="opacity-80 text-base" />
				</template>
				<span class="mt-px">{{ $t('PlayPuzzle.dd.delete-bookmark') }}</span>
			</BaseDropdownItem>
</template>

<script setup lang="ts">
import { usePuzzleBookmarksStore } from '@/stores/bookmarks.js';
import { storeToRefs } from 'pinia';

const emit = defineEmits<{
	(e: 'close'): void
}>();

const bookmarksStore = usePuzzleBookmarksStore();
const { saveStateAsBookmark } = bookmarksStore;
const { canSaveCurrentBoardStateAsBookmark, currentBoardIsSaved, bookmarks } = storeToRefs(bookmarksStore);
</script>

<style scoped>

</style>