<template>
<PuzzleGridHighlightItem
	v-for="(cellHl, idx) in cellHighlights"
	:key="`cell-${idx}`"
	class="highlight hl-cell"
	v-bind="cellHl"
/>
<PuzzleGridHighlightItem
	v-for="(lineHl, idx) in lineHighlights"
	:key="`line-${idx}`"
	class="highlight hl-line"
	v-bind="lineHl"
/>
<PuzzleGridHighlightItem
	v-for="(areaHl, idx) in areaHighlights"
	:key="`area-${idx}`"
	class="highlight hl-area"
	v-bind="areaHl"
/>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { usePuzzleVisualCuesStore } from '@/features/puzzle-visual-cues/store.js';
import { usePuzzleEvent } from '@/composables/puzzle-events.js';
import type { PuzzleBoardHighlight, CellHighlight, LineHighlight, AreaHighlight } from '../helpers/highlights.js';

const visualCuesStore = usePuzzleVisualCuesStore();
const { highlights, highlightsVisible } = storeToRefs(visualCuesStore);
const visibleHighlights = computed((): PuzzleBoardHighlight[] => {
	if (highlightsVisible.value && highlights.value.length > 0) return highlights.value;
	return [];
})

const cellHighlights = computed((): CellHighlight[] => {
	return visibleHighlights.value.filter((hl): hl is CellHighlight => hl.highlightAreaType === 'cell');
})
const lineHighlights = computed((): LineHighlight[] => {
	return visibleHighlights.value.filter((hl): hl is LineHighlight => hl.highlightAreaType === 'line');
})
const areaHighlights = computed((): AreaHighlight[] => {
	return visibleHighlights.value.filter((hl): hl is AreaHighlight => hl.highlightAreaType === 'area');
})

// TODO: Use a better way to remove RuleViolation highlights, as removing all of them can be annoying
// Remove all RuleViolation highlights when a cell on the board is changed
usePuzzleEvent('value-change', () => {
	visualCuesStore.clearHighlightsFromRuleViolations();
})

// When puzzle is paused, and highlights are shown, temporarily hide them, and then show them again on resume
let highlightsHiddenOnPause = false;
usePuzzleEvent('pause', () => {
	if (highlightsHiddenOnPause) {
		console.error('HighlightsHiddenOnPause indicates that the puzzle is already paused so the pause event should not be triggered now...');
	}
	if (visibleHighlights.value.length > 0) {
		visualCuesStore.hideHighlights();
		highlightsHiddenOnPause = true;
	}
})
usePuzzleEvent('resume', () => {
	if (highlightsHiddenOnPause) {
		visualCuesStore.showHighlights();
		highlightsHiddenOnPause = false;
	}
})
</script>
