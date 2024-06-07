<template>
<div class="h-full flex">
	<PuzzleControls
		:can-undo="puzzleHistoryStore.canUndo"
		:can-restart="puzzleStore.canRestart"
		:paused="puzzleStore.paused"
		@undo="puzzleStore.undoLastMove"
		@restart="puzzleStore.restartPuzzle"
		@check="puzzleValidationStore.userCheck"
		@get-hint="puzzleHintsStore.getHint"
	/>
	<PuzzleHintWrapper class="h-full" />
</div>
</template>

<script setup lang="ts">
import { usePuzzleHintsStore } from '@/features/hints/store.js';
import { usePuzzleValidationStore } from '@/stores/assistance/validation.js';
import { usePuzzleHistoryStore } from '@/stores/puzzle-history/history-store.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';

const puzzleHistoryStore = usePuzzleHistoryStore();
const puzzleHintsStore = usePuzzleHintsStore();
const puzzleValidationStore = usePuzzleValidationStore();
const puzzleStore = usePuzzleStore();
</script>