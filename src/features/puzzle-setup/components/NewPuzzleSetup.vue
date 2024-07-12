<template>
<FullWidthPanelLayout>
	<FullWidthPanelBasicCard class="mt-2">
		<template #sectionTitle>
			<div class="flex justify-between">
				<h2 class="text-base font-medium dark:text-slate-100 text-gray-700/90 tracking-wide">{{ $t('Game.difficulty.label') }}</h2>
				<label class="flex items-center gap-2 text-xs">
					<input
						type="checkbox"
						:checked="isDifficultyRangeEnabled"
						@change="toggleDifficultyRangeSelection(!isDifficultyRangeEnabled)"
					>
					{{ $t('NewPuzzle.toggle-difficulty-range') }}
				</label>
			</div>
		</template>

		<template v-if="!isDifficultyRangeEnabled" #container>
			<DifficultySingleSelect
				:labels="DIFFICULTY_LABELS"
				:difficulty="difficulty as DifficultyKey"
				@decrease="updateDifficultyBy(-1)"
				@increase="updateDifficultyBy(1)"
			/>
		</template>
		<template v-else #content>
			<DifficultyRangeSelect
				:labels="DIFFICULTY_LABELS"
				:min="(difficulty as DifficultyRange)[0]"
				:max="(difficulty as DifficultyRange)[1]"
				@set-min="setDifficultyRange({ min: $event })"
				@set-max="setDifficultyRange({ max: $event })"
			/>
		</template>
	</FullWidthPanelBasicCard>

	<FullWidthPanelBasicCard class="mb-4">
		<template #sectionTitle>
			<div class="flex justify-between">
				<h2 class="text-base font-medium dark:text-slate-100 text-gray-700/90 tracking-wide">{{ $t('Game.board-size.label') }}</h2>
				<label class="flex items-center gap-2 text-xs">
					<input
						type="checkbox"
						:checked="isSizeMultipleSelectionEnabled"
						@change="toggleSizeMultipleSelection(!isSizeMultipleSelectionEnabled)"
					>
					{{ $t('NewPuzzle.toggle-multiple-sizes') }}
				</label>
			</div>
		</template>
		<template #content>
			<PuzzleSizeSelect
				:difficulty="difficulty"
				:all-presets="ALL_PRESETS"
				:valid-presets="validPresetsForSelectedDifficulty"
			/>
		</template>
	</FullWidthPanelBasicCard>
</FullWidthPanelLayout>
</template>

<script setup lang="ts">
import { usePuzzleSetupState } from '../composables/puzzle-setup-state.js';
import { DIFFICULTY_LABELS, isDifficultyKey } from '@/config.js';
import type { BoardShape, DifficultyKey } from '@/lib/types.js';
import { useValidPuzzlePresets } from '../composables/valid-presets.js';
import { isValidNewPuzzleSetup } from '../helpers/board-presets.js';
import { computed, watch } from 'vue';
import type { DifficultyRange } from '../helpers/puzzle-setup-config.js';

const {
	size,
	difficulty,
	autoReplayMode,

	isDifficultyRangeEnabled,
	toggleDifficultyRangeSelection,
	setDifficultySingle,
	setDifficultyRange,

	toggleSizeMultipleSelection,
	isSizeMultipleSelectionEnabled,

	persistableState,
	persistState,
} = usePuzzleSetupState();

const updateDifficultyBy = (val: number) => {
	if (typeof difficulty.value !== 'number') {
		throw new Error('Cannot update difficulty by a value when difficulty is not a number.');
	}
	const newDifficulty = difficulty.value + val;
	if (newDifficulty < 1) {
		setDifficultySingle(5);
	} else if (newDifficulty > 5) {
		setDifficultySingle(1);
	} else if (isDifficultyKey(newDifficulty)) {
		setDifficultySingle(newDifficulty);
	} else {
		throw new Error('Unexpected difficulty value after updating difficulty by a value.');
	}
}

const selectedDifficulties = computed((): DifficultyKey | DifficultyKey[] => {
	const diff = difficulty.value;
	if (Array.isArray(diff)) {
		const [min, max] = diff;
		const res: DifficultyKey[] = [];
		for (let i = min; i <= max; i++) {
			if (!isDifficultyKey(i)) throw new Error(`Unexpected difficulty key: ${i}`);
			res.push(i);
		}
		return res;
	} else if (isDifficultyKey(diff as DifficultyKey)) {
		return diff as DifficultyKey;
	} else {
		throw new Error(`Unexpected difficulty value: ${diff}`);
	}
})

const {
	ALL_PRESETS,
	validPresetsForSelectedDifficulty,
} = useValidPuzzlePresets(selectedDifficulties);

watch(persistableState, (state) => {
	if (isValidNewPuzzleSetup(state.size, state.difficulty)) {
		console.log(JSON.parse(JSON.stringify(state)));
		persistState();
	}
}, { deep: true });

export type StartableGameState = {
	difficulty: DifficultyKey | DifficultyRange,
	autoReplayMode: boolean,
	size: BoardShape | BoardShape[] | null
}
const startableGameState = computed((): StartableGameState => {
	// Return the difficulty, the autoReplayMode, and the size(s)
	// However, the size(s) are filtered to only include the ones that are valid according to the difficulty
	// This means that the returned size(s) is an array, a single value, or null
	const sizes: BoardShape[] = Array.isArray(size.value) ? size.value : [size.value];
	const validSizes = sizes.filter(s => validPresetsForSelectedDifficulty.value.some(p => p.width === s.width && p.height === s.height));
	let sizeResult: BoardShape | BoardShape[] | null = null;
	if (validSizes.length === 1) {
		sizeResult = validSizes[0];
	} else if (validSizes.length > 1) {
		sizeResult = validSizes;
	}

	return {
		difficulty: difficulty.value,
		autoReplayMode: autoReplayMode.value,
		size: sizeResult
	}
})

const emit = defineEmits<{
	(e: 'set-start-state', v: StartableGameState): void
}>();
watch(startableGameState, (val) => {
	emit('set-start-state', val);
}, { deep: true, immediate: true });
</script>

<style scoped>
.content-block {
	@apply bg-white shadow rounded dark:bg-slate-800;
}
</style>