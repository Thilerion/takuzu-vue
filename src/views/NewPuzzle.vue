<template>
<div
	id="new-puzzle-page"
	class="fixed top-0 h-vh w-screen overflow-y-auto overflow-x-hidden"
>
	<PageHeader
		:transparent="false"
		elevated
		small
		:back-options="{ type: 'force', prevRouteName: 'Home' }"
	>
		<template #default>{{ $t('NewPuzzle.title') }}</template>
		<template v-if="debugModeEnabled" #right>
			<BaseDropdown
				align-right
				align-below
			>
				<template #trigger="{toggle}">
					<IconBtn @click="toggle"><icon-ic-baseline-more-vert /></IconBtn>
				</template>
				<template #content>
					<BaseDropdownItem v-if="debugModeEnabled">
						<label class="flex items-center">
							<input v-model="autoReplayModeModel" type="checkbox">
							<span class="ml-2">{{ $t('NewPuzzle.options.automatic-replay-mode') }}</span>
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
			<h2 class="text-base font-medium mb-1 dark:text-slate-100 text-gray-700/90 ml-4 tracking-wide">{{ $t('Game.difficulty.label') }}</h2>
			<div class="content-block p-0">
				<DifficultySelect
					:labels="DIFFICULTY_LABELS"
					:difficulty="selectedDifficulty"
					@decrease="decreaseDifficulty"
					@increase="increaseDifficulty"
				/>
			</div>
		</div>
		<div>
			<h2 class="text-base font-medium mb-1 text-gray-700/90 dark:text-slate-100 ml-4 tracking-wide">{{ $t('Game.board-size.label') }}</h2>
			<div
				class="content-block py-4 flex-shrink-0 rounded shadow-sm px-4"
			>
				<div class="mb-1 font-medium text-sm text-gray-500 dark:text-slate-100 dark:font-normal">{{ $t('Game.board-size.normal') }}</div>
				<PuzzleDimensionsBlock
					:presets="squarePresets"
					:selected-dimensions="selectedDimensions"
					@select="selectDimensions"
				/>
				<div class="mb-1 font-medium text-sm text-gray-500 dark:text-slate-100 dark:font-normal">{{ $t('Game.board-size.tall') }}</div>
				<PuzzleDimensionsBlock
					:presets="rectPresets"
					:selected-dimensions="selectedDimensions"
					@select="selectDimensions"
				/>
				<div class="mb-1 font-medium text-sm text-gray-500 dark:text-slate-100 dark:font-normal">{{ $t('Game.board-size.odd') }}</div>
				<PuzzleDimensionsBlock
					:presets="oddPresets"
					:selected-dimensions="selectedDimensions"
					@select="selectDimensions"
				/>
			</div>
		</div>
	</div>

	<div
		class="w-full bg-gray-50 border-t dark:bg-slate-800 dark:border-slate-700 border-gray-200 px-4 pt-2 space-y-2 footer-wrapper sticky bottom-0"
		:class="{ 'pt-4': !hasCurrentSavedGame }"
	>
		<div v-if="hasCurrentSavedGame" class="text-xs text-orange-700 dark:text-red-300 text-end">
			<p>{{ $t('NewPuzzle.starting-a-new-puzzle-will-overwrite') }}</p>
		</div>
		<div class="bottom-grid gap-x-4 w-full h-20">
			<router-link
				v-slot="{ href, navigate }"
				custom
				:to="{ name: 'PlayPuzzle' }"
			>
				<BaseButton
					v-if="hasCurrentSavedGame"
					class="flex items-center flex-shrink overflow-hidden text-wrap text-sm"
					elevated
					element="a"
					:href="href"
					@click="navigate"
				><span class="text-wrap">{{ $t('NewPuzzle.load-save') }}</span></BaseButton>
			</router-link>
			<StartGameButton
				:class="{ 'col-span-2': !hasCurrentSavedGame }"
				:size="selectedDimensions"
				:difficulty-label="selectedDifficultyLabel"
				:difficulty-stars="selectedDifficulty"
				:disabled="startButtonDisabled"
				:loading="puzzleIsLoading"
				:replay="debugAutoReplayModeEnabled"
				@start="startGame"
			/>
		</div>
		
	</div>
</div>
</template>

<script setup lang="ts">
import { DIFFICULTY_LABELS, PRESET_BOARD_SIZES } from '@/config.js';
import { computed, toRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '@/stores/main.js';
import { useSavedPuzzle } from '@/services/savegame/useSavedGame.js';
import { usePuzzleSetupSelection } from '@/components/new-puzzle/puzzle-setup-selection.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';

const { 
	persistedSelection, updatePersistedSelection,
	selectedDifficulty, selectDifficulty,
	selectedDimensions, selectDimensions,
	selectedPuzzleConfig,
} = usePuzzleSetupSelection();

// Display warning message if creating a new game will overwrite the currently saved puzzle
const { hasCurrentSavedGame } = useSavedPuzzle();

// Check debug mode to determine if automatic replay mode can be enabled
const mainStore = useMainStore();
const debugModeEnabled = toRef(mainStore, 'debugMode');
// Persisted value for autoReplayMode stays even if dev/debugMode is disabled, but it won't be used in creating a game if not in dev/debugMode
const debugAutoReplayModeEnabled = computed(() => debugModeEnabled.value && persistedSelection.value.debug_autoReplayMode);
const autoReplayModeModel = computed({
	get() {
		return persistedSelection.value.debug_autoReplayMode ?? false;
	},
	set(value: boolean) {
		updatePersistedSelection({ debug_autoReplayMode: !!value });
	}
})

// Label of selected difficulty, and increase/decrease/selection functions
const selectedDifficultyLabel = computed(() => {
	return DIFFICULTY_LABELS[selectedDifficulty.value];
})
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

// Presets for different board shape types, with maxDifficulty filters
const validPresetsForSelectedDifficulty = computed(() => {
	return PRESET_BOARD_SIZES.filter(preset => {
		return preset.maxDifficulty >= selectedDifficulty.value;
	})
})
const squarePresets = computed(() => {
	return validPresetsForSelectedDifficulty.value.filter(preset => {
		return !preset.isOdd && !preset.isRect;
	})
})
const rectPresets = computed(() => {
	return validPresetsForSelectedDifficulty.value.filter(preset => {
		return preset.isRect;
	})
})
const oddPresets = computed(() => {
	return validPresetsForSelectedDifficulty.value.filter(preset => {
		return preset.isOdd;
	})
})

// Check if the combination of selected difficulty and board size is valid, and disable start button if not
const isValidDifficultySizeCombination = computed(() => {
	const { width, height } = selectedDimensions.value;
	const presetWithDims = validPresetsForSelectedDifficulty.value.find(preset => {
		return preset.width === width && preset.height === height;
	})
	return presetWithDims != null;
})
const startButtonDisabled = computed(() => !isValidDifficultySizeCombination.value);

// Update persistedSelection when selected dimensions or difficulty change, and the combination is valid
watch([isValidDifficultySizeCombination, selectedPuzzleConfig], ([isValid, conf]) => {
	if (!isValid) {
		return;
	}
	const { width, height, difficulty } = conf;
	updatePersistedSelection({ size: { width, height }, difficulty });
})

// Start/create game functions
const puzzleStore = usePuzzleStore();
const router = useRouter();
const puzzleIsLoading = computed(() => puzzleStore.status === 'loading');

async function startGame() {
	if (debugAutoReplayModeEnabled.value) return replayRandom();
	return createGame();
}

async function createGame() {
	puzzleStore.reset();
	try {
		await puzzleStore.initPuzzle({...selectedPuzzleConfig.value});
		router.push({ name: 'PlayPuzzle' });
	} catch(e) {
		// TODO: puzzleStore.initializationError is now true, display a warning of some kind
		// TODO: use custom errors inside store, to generate more informative error messages, and remove the need for displaying just any kind of error message
		if (puzzleStore.initializationError.hasError && puzzleStore.initializationError.errorMessage != null) {
			window.alert(puzzleStore.initializationError.errorMessage);
		} else {
			window.alert(`An unexpected error occured while to trying to generate a new puzzle:\n\n${e}`);
		}
	}			
}

async function replayRandom() {
	puzzleStore.reset();
	try {
		const found = await puzzleStore.replayRandomPuzzle({...selectedPuzzleConfig.value});
		if (!found) throw new Error('Could not retrieve replay puzzle.');
		router.push({ name: 'PlayPuzzle', query: { mode: 'replay' } });
	} catch {
		// TODO: puzzleStore.initializationError is now true, display a warning of some kind (better than windows.alert at least)
		window.alert('No replayable puzzle found.');
	}
}
</script>

<style scoped>
.content-block {
	@apply bg-white shadow rounded dark:bg-slate-800;
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

.bottom-grid {
	@apply grid;
	grid-template-rows: auto;
	grid-template-columns: minmax(min-content, 5fr) minmax(min-content, 8fr);
}
</style>