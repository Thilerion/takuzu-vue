<template>
		<PuzzleGridHighlightItem
			class="highlight hl-cell"
			v-for="(cellHl, idx) in cellHighlights"
			:key="`cell-${idx}`"
			v-bind="cellHl"
		/>
		<PuzzleGridHighlightItem
			class="highlight hl-line"
			v-for="(lineHl, idx) in lineHighlights"
			:key="`line-${idx}`"
			v-bind="lineHl"
		/>
		<PuzzleGridHighlightItem
			class="highlight hl-area"
			v-for="(areaHl, idx) in areaHighlights"
			:key="`area-${idx}`"
			v-bind="areaHl"
		/>
</template>

<script setup lang="ts">
import { useHintHighlightsStore } from '@/stores/highlight-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { HIGHLIGHT_TYPES } from '@/stores/hints/highlights/highlight';
import type { HintAreaHighlight, HintCellHighlight, HintHighlight, HintLineHighlight } from '@/stores/hints/highlights/types.js';


const hintHighlightsStore = useHintHighlightsStore();
const { visible, currentHighlights } = storeToRefs(hintHighlightsStore);
const hasHighlights = computed(() => !!(currentHighlights.value?.length));
const visibleHighlights = computed((): HintHighlight[] => {
	if (!visible.value || !hasHighlights.value) {
		return [];
	}
	return currentHighlights.value;
})

const cellHighlights = computed(() => {
	return visibleHighlights.value.filter((hl): hl is HintCellHighlight => hl.type === HIGHLIGHT_TYPES.CELL);
})
const lineHighlights = computed(() => {
	return visibleHighlights.value.filter((hl): hl is HintLineHighlight => hl.type === HIGHLIGHT_TYPES.LINE);
})
const areaHighlights = computed(() => {
	return visibleHighlights.value.filter((hl): hl is HintAreaHighlight => hl.type === HIGHLIGHT_TYPES.AREA);
})


</script>

<style scoped>

</style>