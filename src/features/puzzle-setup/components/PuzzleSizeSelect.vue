<template>
<div>
	<div
		v-for="(presets, type) in validPresetsByType"
		:key="type"
		class="mb-4 last:mb-0"
	>
		<h3 class="mb-1 font-medium text-sm text-gray-500 dark:text-slate-100 dark:font-normal">{{ type }}</h3>
		<div class="flex flex-wrap gap-2">
			<GameModeDimensionsButton
				v-for="preset in presets"
				:key="`${preset.width}x${preset.height}`"
				:width="preset.width"
				:height="preset.height"
				:selected="isPresetSelected(preset)"
				@click="onSizeButtonClick(preset, $event)"
			/>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import type { BoardShape, DifficultyKey } from '@/lib/types.js';
import { usePuzzleSetupState, type DifficultyRange } from '../composables/puzzle-setup-state.js';
import type { BoardPreset, BoardType } from '@/config.js';
import { computed } from 'vue';
import { groupBy } from '@/utils/array.ts.utils.js';

const props = defineProps<{
	difficulty: DifficultyKey | DifficultyRange,
	allPresets: ReadonlyArray<BoardPreset>,
	validPresets: BoardPreset[],
}>();

const {
	size,
	toggleSize,
	toggleSizeMultipleSelection,
	isSizeMultipleSelectionEnabled,
} = usePuzzleSetupState();

const validPresetsByType = computed((): Record<BoardType, BoardPreset[]> => {
	return groupBy<'type', BoardPreset>(props.validPresets, 'type');
})

const isPresetSelected = (shape: BoardShape): boolean => {
	const sizes = Array.isArray(size.value) ? size.value : [size.value];
	return sizes.some(s => s.width === shape.width && s.height === shape.height);
}

const onSizeButtonClick = (clickedSize: BoardShape, ev: MouseEvent) => {
	const shift = ev.shiftKey;
	const ctrl = ev.ctrlKey || ev.metaKey;

	// Handle shift+click if: shift is pressed AND multiple selection is not enabled
	// Or: multiple selection is enabled, but only 1 size is selected
	const shouldHandleShift = shift && (!isSizeMultipleSelectionEnabled.value || (isSizeMultipleSelectionEnabled.value && Array.isArray(size.value) && size.value.length === 1));
	if (shouldHandleShift) {
		const from = Array.isArray(size.value) ? size.value[0] : size.value;
		handleShiftClick(from, clickedSize);
		return;
	}
	if (ctrl) {
		handleCtrlClick(clickedSize);
		return;
	}

	// fallback, simply toggleSize
	toggleSize(clickedSize);
}

const handleShiftClick = (from: BoardShape, to: BoardShape) => {
	const fromIndex = props.validPresets.findIndex(p => p.width === from.width && p.height === from.height);
	const toIndex = props.validPresets.findIndex(p => p.width === to.width && p.height === to.height);
	if (fromIndex === -1 || toIndex === -1) throw new Error('Invalid sizes in handleShiftClick');

	toggleSizeMultipleSelection(true);

	const min = Math.min(fromIndex, toIndex);
	const max = Math.max(fromIndex, toIndex);
	for (let i = min + 1; i <= max; i++) {
		const preset = props.validPresets[i];
		toggleSize(preset);
	}
}

const handleCtrlClick = (clickedSize: BoardShape) => {
	const curSizes = Array.isArray(size.value) ? size.value : [size.value];
	const isEnabled = curSizes.some(s => s.width === clickedSize.width && s.height === clickedSize.height);
	// If not already enabled, and in single selection mode, enable multiple selection mode and add it
	if (!isSizeMultipleSelectionEnabled.value && !isEnabled) {
		toggleSizeMultipleSelection(true);
		toggleSize(clickedSize);
		return;
	} else {
		toggleSize(clickedSize);
		return;
	}
}
</script>