<template>
	<header class="flex-shrink-0">
		<div class="w-1/3">
			<IconBtn @click="$emit('close')" name="md-close">
				<icon-ic-baseline-close />
			</IconBtn>
		</div>
		<div class="h-full w-full flex flex-col items-center justify-center text-center relative" :class="{ 'pb-2': isReplayMode }">
			<div class="font-medium tracking-wide text-xl">
				{{columns}}<span
					class="px-1"
				>x</span>{{rows}}
			</div>
			<!-- <span class="font-medium tracking-wide text-xl">{{columns}} x {{rows}}</span> -->
			<div v-if="isReplayMode" class="absolute inset-x-0 bottom-1 text-xs text-gray-500 tracking-wide">Replay</div>
		</div>
		<div class="flex flex-row w-1/3 justify-end">
			<IconBtn @click="togglePause" class="opacity-80">
				<icon-ic-baseline-pause v-if="!paused" />
				<icon-ic-baseline-play-arrow v-else />
			</IconBtn>
			<GameBoardHeaderDropdown
				@open-settings="openSettings"
				@dropdown-toggled="dropdownToggled"
			/>
		</div>
	</header>
	<GameBoardHeaderProgressBar
		v-show="puzzleStore.started"
		:progress-ratio="puzzleStore.progress"
		:error="puzzleStore.finishedWithMistakes"
	/>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePuzzleStore } from '@/stores/puzzle/store.js';

const emit = defineEmits<{
	close: [],
	'dropdown-toggled': [val: boolean],
	pause: [],
	resume: []
}>();

const puzzleStore = usePuzzleStore();
const { paused, width, height } = storeToRefs(puzzleStore);

// update with watcher, to prevent values being removed during playPuzzle exit transition after the puzzleStore was reset
const rows = ref<number | null>(null);
const columns = ref<number | null>(null);
watchEffect(() => {
	if (width.value != null && height.value != null) {
		rows.value = height.value;
		columns.value = width.value;
	}
})

const route = useRoute();
const puzzleMode = computed(() => {
	return route.query.mode;
})
const isReplayMode = computed(() => {
	return puzzleMode.value != null && typeof puzzleMode.value === 'string' && puzzleMode.value.toLowerCase() === 'replay';
})

// dropdown/button actions
const router = useRouter();
const dropdownToggled = (value: boolean) => emit('dropdown-toggled', value);
const openSettings = () => {
	router.push({ name: 'PlayPuzzle.settings' });
	dropdownToggled(false);
}
const togglePause = () => paused.value ? emit('resume') : emit('pause');
</script>

<style scoped>
header {
	@apply bg-white dark:bg-slate-800 text-gray-900 dark:text-white;
	@apply flex justify-between items-center h-14 shadow-sm px-2;
}
</style>