<template>
<teleport to="#overlay-container">
	<BaseModal
		ref="modal"
		:auto-open="false"
		:prevent-close="false"
		@close="open = false"
	>
		<template #default="{ close }">
			<section
				ref="scrollContainer"
				class="relative max-w-sm w-full mx-auto bg-white rounded shadow-md block pb-2 text-gray-900 max-h-[70vh] overflow-auto"
			>
				<header class="sticky top-0 z-10 flex items-center pr-0.5 pl-4 py-1 border-b bg-slate-50">
					<h2 class="font-medium">Bookmarks</h2>
					<IconBtn class="ml-auto" @click="close">
						<icon-mdi-close />
					</IconBtn>
				</header>

				<div class="mt-3">
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
			</section>
		</template>
	</BaseModal>
</teleport>
</template>

<script setup lang="ts">
import type BaseModal from '@/components/base/BaseModal.vue';
import { watchEffect, ref, watch } from 'vue';
import { usePuzzleBookmarksStore } from '@/stores/bookmarks.js';
import { storeToRefs } from 'pinia';
import { formatDurationHHMMSS } from '@/utils/duration.utils.js';

const open = defineModel<boolean>({ required: true });
const modal = ref<InstanceType<typeof BaseModal> | null>(null);

watchEffect(() => {
	if (open.value) {
		modal.value?.open();
	} else {
		modal.value?.close();
	}
})

// Automatically scroll to the bottom of the element, where the most recent bookmarks are
const scrollContainer = ref<HTMLElement | null>(null);
watch(scrollContainer, (containerElement) => {
	if (containerElement != null) {
		containerElement.scrollTop = containerElement.scrollHeight;
	}
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