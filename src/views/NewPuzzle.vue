<template>
	<div
		class="fixed top-0 h-vh w-screen overflow-y-auto overflow-x-hidden"
		id="new-puzzle-page"
	>
		<PageHeader :transparent="false" elevated small>
			<template #default>New Puzzle</template>
			<template #right v-if="debugModeEnabled">
				<BaseDropdown
					align-right
					align-below
				>
					<template #trigger="{toggle}">
						<IconBtn @click="toggle"><icon-ic-baseline-more-vert /></IconBtn>
					</template>
					<template #content>
						<!-- <BaseDropdownItem @click="replayRandom">Replay random with selected settings
						</BaseDropdownItem> -->
						<BaseDropdownItem v-if="debugModeEnabled">
							<label class="flex items-center">
								<input type="checkbox" v-model="computedAutoReplayMode">
								<span class="ml-2">Automatic Replay Mode</span>
							</label>
						</BaseDropdownItem>
					</template>
				</BaseDropdown>
			</template>
		</PageHeader>

		<div
			class="w-full px-4 pb-2 pt-3 space-y-4 puzzle-options"
		>
			<div>
				<h2 class="text-base font-medium mb-1 dark:text-slate-100 text-gray-700/90 ml-4 tracking-wide">Difficulty</h2>
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
				<h2 class="text-base font-medium mb-1 text-gray-700/90 dark:text-slate-100 ml-4 tracking-wide">Board size</h2>
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

		<div class="w-full bg-gray-50 border-t dark:bg-slate-800 dark:border-slate-700 border-gray-200 px-4 pt-2 space-y-2 footer-wrapper sticky bottom-0">
			<div v-if="hasCurrentSavedGame" class="text-xs text-orange-700 dark:text-red-400">
				<p>Starting a new puzzle will overwrite your current puzzle in progress.</p>
			</div>
			<StartGameButton
				class="first:mt-4"
				@click="startGame"

				:size="selectedDimensions"
				:difficulty-label="selectedDifficultyLabel"
				:difficulty-stars="selectedDifficulty"
				:disabled="disableStartButton"
				:loading="puzzleIsLoading"
				:replay="debugAutoReplayModeEnabled"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { DIFFICULTY_LABELS, PRESET_BOARD_SIZES, isDifficultyKey } from '@/config';
import { computed, ref, toRef, watch, watchEffect } from 'vue';

import { useRouter } from 'vue-router';
import { usePuzzleStore } from '@/stores/puzzle'
import { useMainStore } from '@/stores/main';
import { useSavedPuzzle } from '@/services/savegame/useSavedGame';
import { useNewPuzzleSetupSelection } from '@/components/new-puzzle/useNewPuzzleSetupSelection';
import type { BoardShape, DifficultyKey } from '@/lib/types.js';

const { hasCurrentSavedGame } = useSavedPuzzle();
// display warning message if creating a new game will overwrite the currently saved puzzle

const mainStore = useMainStore();
const debugModeEnabled = toRef(mainStore, 'debugMode');

const newPuzzleSetupSelection = useNewPuzzleSetupSelection();
const debugAutoReplayModeEnabled = computed(() => debugModeEnabled.value && newPuzzleSetupSelection.value.debug_autoReplayMode);
const computedAutoReplayMode = computed({
	get() {
		return newPuzzleSetupSelection.value.debug_autoReplayMode ?? false;
	},
	set(value) {
		newPuzzleSetupSelection.value.debug_autoReplayMode = !!value;
	}
})
const selectedDifficulty = ref(newPuzzleSetupSelection.value.difficulty);
const selectedDifficultyLabel = computed(() => {
	return DIFFICULTY_LABELS[selectedDifficulty.value];
})
const selectDifficulty = (val: DifficultyKey | number) => {
	if (isDifficultyKey(val)) {
		selectedDifficulty.value = val;
	} else {
		throw new Error(`Cannot select difficulty of "${val}"; this is not a valid DifficultyKey.`);
	}
}
const increaseDifficulty = () => {
	const next = selectedDifficulty.value + 1;
	if (next > 5) {
		selectDifficulty(1);
	} else selectDifficulty(next);
}
const decreaseDifficulty = () => {
	const next = selectedDifficulty.value - 1;
	if (next < 1) {
		selectDifficulty(5);
	} else {
		selectDifficulty(next);
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
	width: newPuzzleSetupSelection.value.size.width,
	height: newPuzzleSetupSelection.value.size.height
})

function selectPreset(preset: BoardShape) {
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
	const merged = {
		...newPuzzleSetupSelection.value,
		difficulty: value[1],
		size: {...value[0]}
	}
	newPuzzleSetupSelection.value = merged;
})

const puzzleStore = usePuzzleStore();
const puzzleIsLoading = computed(() => puzzleStore.loading);
const resetGame = () => puzzleStore.reset();

const router = useRouter();

async function startGame() {
	if (debugAutoReplayModeEnabled.value) return replayRandom();
	return createGame();
}

async function createGame() {
	resetGame();
	const { width, height } = selectedDimensions.value;
	const difficulty = selectedDifficulty.value;

	try {
		await puzzleStore.initPuzzle({ width, height, difficulty });
		router.push({ name: 'PlayPuzzle' });
	} catch(e) {
		console.warn(e);
	}			
}

async function replayRandom() {
	resetGame();
	const { width, height } = selectedDimensions.value;
	const difficulty = selectedDifficulty.value;

	try {
		const found = await puzzleStore.replayRandomPuzzle({ width, height, difficulty });
		if (!found) throw new Error('Could not retrieve replay puzzle.');
		router.push({ name: 'PlayPuzzle', query: { mode: 'replay' } });
	} catch {
		window.alert('No replayable puzzle found.'); // TODO: alternative to an alert
	}
}
</script>

<style scoped>
.content-block {
	@apply bg-white py-4 shadow rounded dark:bg-slate-800;
}
.difficulty-select {
	@apply py-0;
}
.footer-wrapper {
	padding-bottom: max(env(safe-area-inset-bottom) + 0.5rem, 1rem);
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