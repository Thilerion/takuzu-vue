<template>
<div class="my-2 px-0.5">
	<BaseButton
		class="w-full -mb-0.5 transition-colors duration-500"
		:class="{
			'!rounded-b-none': showPuzzleStrings,
			'!bg-gray-100': !showPuzzleStrings
		}"
		@click="showPuzzleStrings = !showPuzzleStrings"
	>
		<div class="w-full flex justify-between">
			<span>Puzzle strings</span>
			<icon-ic-outline-keyboard-arrow-down
				class="ml-auto transition-transform duration-500"
				:class="{ 'rotate-180': showPuzzleStrings }"
			/>
		</div>
	</BaseButton>
	<ExpandTransition
		:duration="200"
		:show="showPuzzleStrings"
		@after-enter="scrollToElement"
	>
		<div ref="el">
			<div class="pt-4 pb-2 px-3 flex gap-y-2 w-full flex-col border border-gray-200 border-t-transparent">
				<CustomPuzzleInputStringBlock
					:value="asCustomRle || placeholderValue"
					label="Short"
				/>
				<CustomPuzzleInputStringBlock
					:value="asCustomLong || placeholderValue"
					label="Long"
				/>
				<CustomPuzzleInputStringBlock
					:value="asExportString"
					label="Export string"
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

<style scoped>

</style>
