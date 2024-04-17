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
					class="relative bg-white rounded shadow-md block pb-2 text-gray-900 max-h-[70vh] overflow-auto"
					ref="scrollContainer"
				>
					<header class="sticky top-0 z-10 flex items-center pr-0.5 pl-4 border-b bg-slate-50">
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
								class="py-2 mx-2 flex border-b last:border-b-0"
							>
								<button
									class="flex-1 w-full px-2 text-start"
									@click="loadBookmark(bookmark.id)"
								>
									<div>{{ $t('PlayPuzzle.dd.bookmark-n', { n: bookmark.id + 1 }) }}</div>
									<div class="flex text-sm opacity-80">
										<span class="">{{ $t('PlayPuzzle.dd.percent-solved', { percentFormatted: $n(bookmark.progress, 'percent', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }) }}</span>
										<div class="mx-1 flex-none">-</div>
										<div class="w-[7ch] shrink-0 grow-0">{{ bookmark.timerOnSave }}</div>
									</div>
								</button>
								<div class="flex-none w-auto flex items-center">
									<IconBtn
										@click="deleteBookmark(bookmark.id)"
									><icon-mdi-close class="w-5 h-5 text-gray-600" /></IconBtn>
								</div>
							</li>
						</ul>						
					</div>
				</section>
			</template>
		</BaseModal>
	</teleport>
</template>

<script setup lang="ts">
import type BaseModal from '@/components/global/BaseModal.vue';
import { watchEffect, ref } from 'vue';
import { usePuzzleBookmarksStore } from '@/stores/bookmarks.js';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

const open = defineModel({ required: true });
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
</script>

<style scoped>

</style>