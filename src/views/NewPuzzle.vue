<template>
	<div
		class="fixed top-0 h-vh w-screen overflow-y-auto overflow-x-hidden"
		id="new-puzzle-page"
	>
		<PageHeader class="bg-white shadow-sm" small>
			<template #default>New Puzzle</template>
		</PageHeader>

		<div
			class="w-full px-4 pb-2 pt-3 space-y-4 puzzle-options"
		>
			<div>
				<h2 class="text-base font-medium mb-1 text-gray-700/90 ml-4 tracking-wide">Difficulty</h2>
				<div class="content-block px-4 difficulty-select">
					<DifficultySelect
						@decrease="decreaseDifficulty"
						@increase="increaseDifficulty"
						:labels="DIFFICULTY_LABELS"
						:difficulty="selectedDifficulty"
					/>
				</div>
			</div>
			<div>
				<h2 class="text-base font-medium mb-1 text-gray-700/90 ml-4 tracking-wide">Board size</h2>
				<div
					class="content-block flex-shrink-0 rounded shadow-sm px-4"
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

		<div class="w-full bg-gray-50 border-t border-gray-200 px-4 pb-4 pt-2 space-y-2 footer-wrapper sticky bottom-0">
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
import StartGameButton from '../components/new-puzzle/StartGameButton.vue';
import PuzzleDimensionsBlock from '../components/new-puzzle/PuzzleDimensionsBlock.vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { usePreviousSelection } from '../components/new-puzzle/usePreviousSelection.js';
import DifficultySelect from '../components/new-puzzle/DifficultySelect.vue';

import { useSavedPuzzle } from '@/services/useSavedPuzzle.js';
import { usePuzzleStore } from '@/stores/puzzle.js';
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

const puzzleStore = usePuzzleStore();
const puzzleIsLoading = computed(() => puzzleStore.loading);
const resetGame = () => puzzleStore.reset();

onBeforeRouteLeave((to, from) => {
	if (!to.name === 'PlayPuzzle' || !puzzleStore.initialized) {
		console.warn('Leaving FreePlay route without a puzzle being set! Probably good to reset the puzzle in the store.');
		resetGame();
	}
	return true;
})

const router = useRouter();

async function createGame() {
	resetGame();
	const { width, height } = selectedDimensions.value;
	const difficulty = selectedDifficulty.value;

	console.log({ width, height, difficulty });

	try {
		await puzzleStore.initPuzzle({ width, height, difficulty });
		router.push({ name: 'PlayPuzzle' });
	} catch(e) {
		console.warn(e);
	}			
}
</script>

<style scoped>
.content-block {
	@apply bg-white py-4 shadow rounded;
}
.difficulty-select {
	@apply py-0;
}
.footer-wrapper {
	box-shadow: 0 -12px 14px -16px rgba(0,0,0,.2);
}

.puzzle-options {
	/* @apply flex flex-col justify-center; */
	@apply grid grid-cols-1;
	grid-template-rows: 12fr [difficulty] auto 4fr [boardsize] auto 8fr;
}
.puzzle-options > *:first-child {
	grid-row: difficulty / span 1;
}
.puzzle-options > *:nth-child(2) {
	grid-row: boardsize / span 1;
}

#new-puzzle-page {
	@apply grid grid-cols-1;
	grid-template-rows: [header] auto [content] 1fr [footer] auto;
	@apply overflow-y-auto overflow-x-hidden;
}
</style>