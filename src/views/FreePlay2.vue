<template>
	<div class="freeplay h-vh overflow-y-hidden flex flex-col">
		<div class="flex-1 overflow-y-auto pb-4 flex flex-col">
			<PageHeader class="flex-shrink-0" small>
				<template #default>New Game</template>
			</PageHeader>
			<div class="main flex-1 w-full sm:w-[500px] mx-auto flex-shrink-0 my-auto justify-around">
			<div class="pb-2">
				<h2 class="text-base font-medium mb-1 text-gray-700/90 ml-4 tracking-wide">Difficulty</h2>
				<div class="content-block difficulty-select">
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
			</div>
		</div>
		<div class="w-full bg-gray-50 border-t border-gray-200 px-4 pb-4 pt-2 footer-wrapper space-y-2">
			<div v-if="hasCurrentSavedGame" class="text-xs text-orange-700">
				<p>Starting a new puzzle will overwrite your current puzzle in progress.</p>
			</div>
			<StartGameButton
				class="first:mt-4"
				@click="createGame"
				:size="selectedDimensions"
				:difficulty-label="selectedDifficultyLabel"
				:difficulty-stars="selectedDifficulty"
				:disabled="disableStartButton"
				:loading="puzzleIsLoading"
			/>
		</div>
	</div>
</template>

<script setup>
import { DIFFICULTY_LABELS, PRESET_BOARD_SIZES } from '@/config.js';
import { computed, onBeforeUpdate, onMounted, ref, watch, watchEffect } from 'vue';
import PageHeader from '../components/global/base-layout/PageHeader.vue';
import StartGameButton from '../components/new-game2/StartGameButton.vue';
import PuzzleDimensionsBlock from '../components/new-game2/PuzzleDimensionsBlock.vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { usePreviousSelection } from '../components/new-game2/usePreviousSelection.js';
import DifficultySelect from '../components/new-game2/DifficultySelect.vue';

import { useSavedPuzzle } from '@/services/useSavedPuzzle.js';
const { hasCurrentSavedGame } = useSavedPuzzle();
// display warning message if creating a new game will overwrite the currently saved puzzle

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

.main {
	@apply px-4 flex flex-col;
}

.content-block {
	@apply bg-white px-4 py-4 shadow rounded;
}
.difficulty-select {
	@apply py-0;
}

.footer-wrapper {
	box-shadow: 0 -12px 14px -16px rgba(0,0,0,.2);
}
</style>