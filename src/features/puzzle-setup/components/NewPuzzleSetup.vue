<template>
<div class="w-full px-4 pb-2 pt-3 space-y-4 puzzle-options">
	<div>
		<div class="flex justify-between">
			<h2 class="text-base font-medium mb-1 dark:text-slate-100 text-gray-700/90 ml-4 tracking-wide">{{ $t('Game.difficulty.label') }}</h2>
			<label class="pr-4">
				<input
					type="checkbox"
					:checked="isDifficultyRangeEnabled"
					@change="toggleDifficultyRangeSelection(!isDifficultyRangeEnabled)"
				>
				Enable Difficulty Range
			</label>
		</div>
		<div class="content-block p-0">
			<DifficultySingleSelect
				v-if="!isDifficultyRangeEnabled"
				:labels="DIFFICULTY_LABELS"
				:difficulty="difficulty as DifficultyKey"
				@decrease="updateDifficultyBy(-1)"
				@increase="updateDifficultyBy(1)"
			/>
			<DifficultyRangeSelect
				v-else
				:labels="DIFFICULTY_LABELS"
				:min="(difficulty as DifficultyRange)[0]"
				:max="(difficulty as DifficultyRange)[1]"
				@set-min="setDifficultyRange({ min: $event })"
				@set-max="setDifficultyRange({ max: $event })"
			/>
		</div>
	</div>
	<div>
		<h2 class="text-base font-medium mb-1 text-gray-700/90 dark:text-slate-100 ml-4 tracking-wide">{{ $t('Game.board-size.label') }}</h2>
		<div
			class="content-block py-4 flex-shrink-0 rounded shadow-sm px-4"
		>
			
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { usePuzzleSetupState, type DifficultyRange } from '../composables/puzzle-setup-state.js';
import { DIFFICULTY_LABELS, isDifficultyKey } from '@/config.js';
import type { DifficultyKey } from '@/lib/types.js';

const {
	difficulty,

	isDifficultyRangeEnabled,
	toggleDifficultyRangeSelection,
	setDifficultySingle,
	setDifficultyRange,
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