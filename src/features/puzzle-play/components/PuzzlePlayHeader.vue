<template>
<header>
	<div class="flex justify-between items-center h-14 shadow-sm px-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
		<div class="w-1/3">
			<IconBtn name="md-close" @click="exitGame">
				<icon-ic-baseline-close />
			</IconBtn>
		</div>
		<div class="h-full w-full flex flex-col items-center justify-center text-center relative flex-1" :class="{ 'pb-2': isReplayMode }">
			<div class="font-medium tracking-wide text-xl">
				{{ boardShape.width }}<span class="px-1">x</span>{{ boardShape.height }}
			</div>
			<div v-if="isReplayMode" class="absolute inset-x-0 bottom-1 text-xs text-gray-500 tracking-wide">Replay</div>
		</div>
		<div class="flex flex-row w-1/3 justify-end">
			<IconBtn class="opacity-80" @click="togglePause">
				<icon-ic-baseline-pause v-if="!puzzleStore.paused" />
				<icon-ic-baseline-play-arrow v-else />
			</IconBtn>
			<PuzzlePlayHeaderDd
				@open-settings="openSettings"
				@dropdown-toggled="puzzleUiStateStore.setDropdownOpen"
			/>
		</div>
	</div>
	
	<PuzzlePlayHeaderProgressBar
		:progress-ratio="puzzleStore.progress"
		:error="puzzleStore.finishedWithMistakes"
	/>
</header>
</template>

<script setup lang="ts">
import type { BoardShape } from '@/lib/types.js';
import { usePlayPuzzleUiStateStore } from '@/stores/puzzle/play-ui-state-store.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { usePuzzlePauseResume } from '@/stores/puzzle/usePuzzlePauseResume.js';
import { computed, watchEffect, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const emit = defineEmits<{
	(e: 'save'): void,
	(e: 'exit'): void
}>();

const exitGame = () => {
	emit('save');
	emit('exit');
}

const puzzleStore = usePuzzleStore();
const puzzleUiStateStore = usePlayPuzzleUiStateStore();
const { manualPauseGame, manualResumeGame } = usePuzzlePauseResume();

// Rows and columns from puzzleStore, but stored as ref to prevent them
// from becoming empty when the store is reset, but the current route is transitioning away
const boardShape = ref<BoardShape>({ width: 0, height: 0 });
watchEffect(() => {
	if (puzzleStore.width != null && puzzleStore.height != null) {
		boardShape.value.width = puzzleStore.width;
		boardShape.value.height = puzzleStore.height;
	}
})

// Determine if the puzzle is in replay mode
// TODO: Set the game mode inside a store
const route = useRoute();
const puzzleMode = computed(() => {
	return route.query.mode;
})
const isReplayMode = computed(() => {
	return puzzleMode.value != null && typeof puzzleMode.value === 'string' && puzzleMode.value.toLowerCase() === 'replay';
})

const togglePause = () => puzzleStore.paused ? manualResumeGame() : manualPauseGame();

const router = useRouter();
const openSettings = () => {
	router.push({ name: 'PlayPuzzle.settings' });
	puzzleUiStateStore.setDropdownOpen(false);
}
</script>