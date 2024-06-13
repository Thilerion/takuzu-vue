<template>
<div>
	<button
		class="w-full pr-3 py-2"
		@click="showPuzzleStrings = !showPuzzleStrings"
	>
		<div class="w-full flex justify-between">
			<span class="font-bold text-gray-600 tracking-wide">{{ $t('CustomPuzzleInput.puzzle-strings.title') }}</span>
			<icon-ic-outline-keyboard-arrow-down
				class="ml-auto transition-transform duration-500 text-base"
				:class="{ 'rotate-180': showPuzzleStrings }"
			/>
		</div>
	</button>
	<ExpandTransition
		:duration="200"
		:show="showPuzzleStrings"
		@after-enter="scrollToElement"
	>
		<div ref="el">
			<div class="pt-4 pb-2 pr-4 flex gap-y-2 w-full flex-col">
				<CustomPuzzleInputStringBlock
					:value="asCustomRle || placeholderValue"
					:label="$t('CustomPuzzleInput.puzzle-strings.short')"
				/>
				<CustomPuzzleInputStringBlock
					:value="asCustomLong || placeholderValue"
					:label="$t('CustomPuzzleInput.puzzle-strings.long')"
				/>
				<CustomPuzzleInputStringBlock
					:value="asExportString"
					:label="$t('CustomPuzzleInput.puzzle-strings.export-string')"
				/>
			</div>
		</div>
	</ExpandTransition>
</div>
</template>

<script setup lang="ts">
import { puzzleGridToBoardString, puzzleGridToExportString } from '@/lib/board/board-conversion.helpers.js';
import type { PuzzleGrid } from '@/lib/types.js';
import { computed } from 'vue';
import { ref } from 'vue';
import { toCustomPuzzleStringRLE } from '../services/string-conversions/custom-rle.js';
import { gridToCustomPuzzleStringLong } from '../services/string-conversions/custom-long.js';
import { watchEffect } from 'vue';

const props = defineProps<{
	grid: PuzzleGrid | null;
}>();

watchEffect(() => {
	console.log(props.grid);
})

const showPuzzleStrings = ref(false);
const el = ref<HTMLElement>();
const scrollToElement = () => {
	if (el.value) {
		el.value.scrollIntoView({ behavior: 'smooth'});
	}
}

const placeholderValue = ref('<no grid available>');

const boardString = computed(() => {
	if (props.grid == null) return '';
	return puzzleGridToBoardString(props.grid);
})

const asCustomRle = computed(() => {
	if (!boardString.value) return '';
	return toCustomPuzzleStringRLE(boardString.value);
})
const asCustomLong = computed(() => {
	if (!props.grid) return '';
	return gridToCustomPuzzleStringLong(props.grid);
})
const asExportString = computed(() => {
	if (!props.grid) return '';
	return puzzleGridToExportString(props.grid);
})
</script>