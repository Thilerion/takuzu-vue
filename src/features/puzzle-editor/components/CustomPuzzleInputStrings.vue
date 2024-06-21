<template>
<BaseCollapsible
	#="{ isOpen: showPuzzleStrings}"
	@after-open="scrollToElement"
>
	<BaseCollapsibleTrigger
		class="w-full pr-3 py-2"
		event-name="click"
		tag="button"
	>
		<div class="w-full flex justify-between">
			<span class="font-bold text-gray-600 tracking-wide">{{ $t('PuzzleEditor.puzzle-strings.title') }}</span>
			<icon-ic-outline-keyboard-arrow-down
				class="ml-auto transition-transform duration-500 text-base"
				:class="{ 'rotate-180': showPuzzleStrings }"
			/>
		</div>
	</BaseCollapsibleTrigger>
	<BaseCollapsibleContent
		:duration="200"
	>
		<div ref="el">
			<div class="pt-4 pb-2 pr-4 flex gap-y-2 w-full flex-col">
				<CustomPuzzleInputStringBlock
					:placeholder="placeholderValue"
					:value="asCustomRle"
					:label="$t('PuzzleEditor.puzzle-strings.short')"
				/>
				<CustomPuzzleInputStringBlock
					:placeholder="placeholderValue"
					:value="asCustomLong"
					:label="$t('PuzzleEditor.puzzle-strings.long')"
				/>
				<CustomPuzzleInputStringBlock
					:placeholder="placeholderValue"
					:value="asExportString"
					:label="$t('PuzzleEditor.puzzle-strings.export-string')"
				/>
			</div>
		</div>
	</BaseCollapsibleContent>
</BaseCollapsible>
</template>

<script setup lang="ts">
import { puzzleGridToBoardString, puzzleGridToExportString } from '@/lib/board/board-conversion.helpers.js';
import type { PuzzleGrid } from '@/lib/types.js';
import { toCustomPuzzleStringRleWithDims } from '../services/string-conversions/custom-rle.js';
import { gridToCustomPuzzleStringLong } from '../services/string-conversions/custom-long.js';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
	grid: PuzzleGrid | null;
}>();

const el = ref<HTMLElement>();
const scrollToElement = () => {
	if (el.value) {
		el.value.scrollIntoView({ behavior: 'smooth'});
	}
}

const { t } = useI18n();
const placeholderValue = computed(() => {
	return `<${t('PuzzleEditor.puzzle-strings.no-grid-available')}>`;
})

const boardString = computed(() => {
	if (props.grid == null) return '';
	return puzzleGridToBoardString(props.grid);
})

const asCustomRle = computed(() => {
	if (!boardString.value) return null;
	return toCustomPuzzleStringRleWithDims(boardString.value, {
		width: props.grid![0].length,
		height: props.grid!.length
	});
})
const asCustomLong = computed(() => {
	if (!props.grid) return null;
	return gridToCustomPuzzleStringLong(props.grid);
})
const asExportString = computed(() => {
	if (!props.grid) return null;
	return puzzleGridToExportString(props.grid);
})
</script>