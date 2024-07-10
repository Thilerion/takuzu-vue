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
				@click="toggleSize(preset)"
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
	difficulty: DifficultyKey | Readonly<DifficultyRange>,
	allPresets: ReadonlyArray<BoardPreset>,
	validPresets: BoardPreset[],
}>();

const {
	size,
	toggleSize,
} = usePuzzleSetupState();

const validPresetsByType = computed((): Record<BoardType, BoardPreset[]> => {
	return groupBy<'type', BoardPreset>(props.validPresets, 'type');
})

const isPresetSelected = (shape: BoardShape): boolean => {
	const sizes = Array.isArray(size.value) ? size.value : [size.value];
	return sizes.some(s => s.width === shape.width && s.height === shape.height);
}
</script>