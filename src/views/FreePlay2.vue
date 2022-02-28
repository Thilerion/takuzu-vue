<template>
	<div class="freeplay flex flex-col overflow-x-hidden pb-28 min-h-full overflow-y-auto">
		<PageHeader class="flex-shrink-0" small>
			<template #default>New Game</template>
		</PageHeader>
		<div class="main flex-1 w-full sm:w-[500px] mx-auto flex-shrink-0 my-auto">
			<div class="pb-3">
			<h2 class="text-base font-medium mb-1 text-gray-700/90 ml-4 tracking-wide">Difficulty</h2>
			<div class="content-block difficulty-select mb-6">
				<DifficultySelect
					@decrease="decreaseDifficulty"
					@increase="increaseDifficulty"
					:labels="DIFFICULTY_LABELS"
					:difficulty="selectedDifficulty"
				/>
			</div>
			</div>
			<div>
			<h2 class="text-base font-medium mb-1 text-gray-700/90 ml-4 tracking-wide">Puzzle size</h2>
			<div
				class="content-block flex-shrink-0 rounded shadow-sm"
			>
				<div class="mb-1 font-medium text-sm text-gray-500">Normal</div>
				<PuzzleDimensionsBlock
					:presets="squarePresets"
					:selected-dimensions="selectedDimensions"
					@select="selectPreset"
				/>
				<div class="mb-1 font-medium text-sm text-gray-500">Tall</div>
				<PuzzleDimensionsBlock
					:presets="rectPresets"
					:selected-dimensions="selectedDimensions"
					@select="selectPreset"
				/>
				<div class="mb-1 font-medium text-sm text-gray-500">Odd</div>
				<PuzzleDimensionsBlock
					:presets="oddPresets"
					:selected-dimensions="selectedDimensions"
					@select="selectPreset"
				/>
			</div>
			</div>

			<div class="fixed bottom-0 inset-x-0 p-4 bg-gray-50 border-t border-gray-200 shadow-lg">
				<StartGameButton
					@click="createGame"
					:size="selectedDimensions"
					:difficulty-label="selectedDifficultyLabel"
					:difficulty-stars="selectedDifficulty"
					:disabled="disableStartButton"
					:loading="puzzleIsLoading"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { DIFFICULTY_LABELS, PRESET_BOARD_SIZES } from '@/config.js';
import { computed, ref, watch, watchEffect } from 'vue';
import PageHeader from '../components/global/base-layout/PageHeader.vue';
import StartGameButton from '../components/new-game2/StartGameButton.vue';
import PuzzleDimensionsBlock from '../components/new-game2/PuzzleDimensionsBlock.vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { usePreviousSelection } from '../components/new-game2/usePreviousSelection.js';
import DifficultySelect from '../components/new-game2/DifficultySelect.vue';

const previousSelection = usePreviousSelection();

const selectedDifficulty = ref(previousSelection.value.difficulty);
const selectedDifficultyLabel = computed(() => {
	return DIFFICULTY_LABELS[selectedDifficulty.value];
})
const increaseDifficulty = () => {
	const next = selectedDifficulty.value + 1;
	if (next > 5) {
		selectedDifficulty.value = 1;
	} else selectedDifficulty.value = next;
}
const decreaseDifficulty = () => {
	const next = selectedDifficulty.value - 1;
	if (next < 1) {
		selectedDifficulty.value = 5;
	} else {
		selectedDifficulty.value = next;
	}
}

const validPresets = computed(() => {
	return PRESET_BOARD_SIZES.filter(preset => {
		return preset.maxDifficulty >= selectedDifficulty.value;
	})
})

const squarePresets = computed(() => {
	return validPresets.value.filter(preset => {
		return !preset.isOdd && !preset.isRect;
	})
})
const rectPresets = computed(() => {
	return validPresets.value.filter(preset => {
		return preset.isRect;
	})
})
const oddPresets = computed(() => {
	return validPresets.value.filter(preset => {
		return preset.isOdd;
	})
})

const disableStartButton = ref(false);

const selectedDimensions = ref({
	width: previousSelection.value.size.width,
	height: previousSelection.value.size.height
})

function selectPreset(preset) {
	selectedDimensions.value = {
		width: preset.width,
		height: preset.height
	}
}

const isValidDifficultySizeCombination = computed(() => {
	const { width, height } = selectedDimensions.value;
	const presetWithDims = validPresets.value.find(preset => {
		return preset.width === width && preset.height === height;
	})
	return presetWithDims != null;
})

watchEffect(() => {
	if (!isValidDifficultySizeCombination.value) {
		disableStartButton.value = true;
	} else {
		disableStartButton.value = false;
	}
})

watch([selectedDimensions, selectedDifficulty], (value) => {
	if (!isValidDifficultySizeCombination.value) {
		return;
	}
	const obj = {
		difficulty: value[1],
		size: {
			width: value[0].width,
			height: value[0].height
		}
	};
	previousSelection.value = obj;
})

const store = useStore();
const puzzleIsLoading = computed(() => store.state.puzzle.loading);
const resetGame = () => store.dispatch('puzzle/reset');

onBeforeRouteLeave((to, from) => {
	if (!to.name === 'PlayPuzzle' || !store.state.puzzle.initialized) {
		console.warn('Leaving FreePlay route without a puzzle being set! Probably good to reset the puzzle in the store.');
		resetGame();
	}
	return true;
})

const router = useRouter();

async function createGame() {
	store.dispatch('puzzle/reset');
	const { width, height } = selectedDimensions.value;
	const difficulty = selectedDifficulty.value;

	console.log({ width, height, difficulty });

	try {
		await store.dispatch('puzzle/initPuzzle', { width, height, difficulty });
		console.log('game created?');
		console.log(store.state.puzzle);
		router.push({ name: 'PlayPuzzle' });
	} catch(e) {
		console.warn(e);
	}			
}

</script>

<style scoped>
.freeplay {
	height: var(--vh-total);
	z-index: 100;
	width: 100vw;
	position: fixed;
	top: 0;
	@apply text-gray-900 bg-gray-100 dark:bg-gray-900 dark:text-gray-50;
}

.main {
	@apply px-4 flex flex-col justify-center;
}

.content-block {
	@apply bg-white px-4 py-4 shadow rounded;
}
.difficulty-select {
	@apply py-0;
}
</style>