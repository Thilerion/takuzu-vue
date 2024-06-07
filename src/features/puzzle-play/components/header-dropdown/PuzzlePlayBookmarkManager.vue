<template>
<teleport to="#overlay-container">
	<BaseDialog
		ref="dialogEl"
		v-model="open"
		class="backdrop:bg-black/30"
		content-classes="relative flex flex-col bg-white rounded shadow-lg text-gray-900 max-h-[70vh] backdrop:bg-black/30 bm-dialog p-0 w-full"
		@open="scrollToBottom(scrollContainer)"
	>
		<template #default="{ close }">
			<header class="sticky top-0 z-10 flex items-center pr-0.5 pl-4 py-1 border-b bg-slate-50">
				<h2 class="font-medium">Bookmarks</h2>
				<IconBtn class="ml-auto" @click="close">
					<icon-mdi-close />
				</IconBtn>
			</header>

			<div ref="scrollContainer" class="pt-3 overflow-auto">
				<ul class="bookmarks-list">
					<li
						v-for="bookmark in bookmarks"
						:key="bookmark.id"
						class="mx-2 flex border-b last:border-b-0"
					>
						<button
							class="flex-1 w-full px-2 text-start py-2"
							@click="loadBookmark(bookmark.id)"
						>
							<div>{{ $t('PlayPuzzle.dd.bookmark-n', { n: bookmark.id + 1 }) }}</div>
							<div class="flex text-sm opacity-80">
								<span>{{ $t('PlayPuzzle.dd.percent-solved', { percentFormatted: $n(bookmark.progress, 'percent', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }) }}</span>
								<div class="mx-1 flex-none">-</div>
								<div class="w-[7ch] shrink-0 grow-0">{{ formatDurationHHMMSS(bookmark.timerOnSave, { emptyHours: false, padFirst: false }) }}</div>
							</div>
						</button>
						<div class="flex-none w-auto flex items-center">
							<IconBtn
								@click="deleteBookmark(bookmark.id)"
							><icon-ic-outline-delete-forever class="w-5 h-5 text-gray-500" /></IconBtn>
						</div>
					</li>
				</ul>
					
				<div class="px-4 py-3 w-full flex">
					<button
						class="text-xs ml-auto rounded border-red-800 border p-2 font-medium bg-white disabled:opacity-50 disabled:border-red-900/50 disabled:cursor-default cursor-pointer"
						:disabled="!bookmarks.length"
						@click="clearAll"
					><span class="text-red-700">Clear all bookmarks</span></button>
				</div>
			</div>
		</template>
	</BaseDialog>
</teleport>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { usePuzzleBookmarksStore } from '@/stores/bookmarks.js';
import { storeToRefs } from 'pinia';
import { formatDurationHHMMSS } from '@/utils/duration.utils.js';

const open = defineModel<boolean>({ required: true });

// Automatically scroll to the bottom of the element, where the most recent bookmarks are
const scrollContainer = ref<HTMLElement | null>(null);
const scrollToBottom = (el: HTMLElement | null) => {
	if (el == null) return;
	el.scrollTop = el.scrollHeight;
}
watchEffect(() => {
	if (scrollContainer.value) scrollToBottom(scrollContainer.value);
})

// Logic for bookmarks
const bookmarksStore = usePuzzleBookmarksStore();
const { bookmarks } = storeToRefs(bookmarksStore);
const { deleteBookmark } = bookmarksStore;

const loadBookmark = (id: number) => {
	bookmarksStore.loadBookmark(id);
	open.value = false;
}
const clearAll = () => {
	bookmarks.value = [];
	open.value = false;
}
</script>

<style scoped>
:global(.bm-dialog) {
	max-width: min(100vw - 1.5rem, 38ch);
}
</style>