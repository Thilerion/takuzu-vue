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

	<NewPuzzleSetup
		@set-start-state="setStartState"
	/>

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
			<SetupNewPuzzleButton
				:class="{ 'col-span-2': !hasCurrentSavedGame }"
				:size="startState?.size ?? null"
				:difficulty="startState?.difficulty ?? null"
				:auto-replay-mode="autoReplayMode"
				:loading="puzzleIsLoading"
				@start="startGame"
			/>
		</div>
		
	</div>
</div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '@/stores/main.js';
import { useSavedPuzzle } from '@/services/savegame/useSavedGame.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { useGameStore, type PuzzleSetupConfig } from '@/stores/game.js';
import { usePuzzleSetupState } from '@/features/puzzle-setup/composables/puzzle-setup-state.js';
import { ref } from 'vue';
import type { StartableGameState } from '@/features/puzzle-setup/components/NewPuzzleSetup.vue';

const {
	autoReplayMode,
} = usePuzzleSetupState();
const startState = ref<null | StartableGameState>(null);
function setStartState(val: StartableGameState) {
	startState.value = val;
}

// Display warning message if creating a new game will overwrite the currently saved puzzle
const { hasCurrentSavedGame } = useSavedPuzzle();

// Check debug mode to determine if automatic replay mode can be enabled
const mainStore = useMainStore();
const debugModeEnabled = toRef(mainStore, 'debugMode');
// Persisted value for autoReplayMode stays even if dev/debugMode is disabled, but it won't be used in creating a game if not in dev/debugMode
const debugAutoReplayModeEnabled = computed(() => debugModeEnabled.value && autoReplayMode.value);
const autoReplayModeModel = computed({
	get() {
		return autoReplayMode.value ?? false;
	},
	set(value: boolean) {
		autoReplayMode.value = value;
	}
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
	if (startState.value == null || startState.value.difficulty == null || startState.value.size == null) {
		throw new Error('Cannot start game; start state is invalid.');
	}
	const state: PuzzleSetupConfig = {
		difficulty: startState.value.difficulty,
		size: startState.value.size,
		options: {
			// TODO: add option to pickSizeWeightByNumCells
			pickSizeWeightByNumCells: false,
		}
	}
	puzzleStore.reset();
	const gameStore = useGameStore();
	try {
		// await puzzleStore.initPuzzle({...selectedPuzzleConfig.value});
		await gameStore.playNewPuzzle(state);
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
	if (startState.value == null || startState.value.difficulty == null || startState.value.size == null) {
		throw new Error('Cannot start game; start state is invalid.');
	}
	const state: PuzzleSetupConfig = {
		difficulty: startState.value.difficulty,
		size: startState.value.size,
		options: {
			// TODO: add option to pickSizeWeightByNumCells
			pickSizeWeightByNumCells: false,
		}
	}
	puzzleStore.reset();
	const gameStore = useGameStore();
	try {
		await gameStore.playPuzzleWithAutoReplay(state);
		router.push({ name: 'PlayPuzzle' });
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