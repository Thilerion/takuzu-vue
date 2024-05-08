<template>
<select
	:id="id"
	v-model="modelValue"
	class="w-full text-sm"
>
	<option :value="null">{{ $t('Statistics.History.filter.any') }}</option>
	<option 
		v-for="opt in boardSizeOptions"
		:key="opt.value"
		:value="opt.value"
	>{{ opt.value }}</option>
</select>
</template>

<script setup lang="ts">
import { PRESET_BOARD_SIZES, type BoardType } from '@/config.js';
import type { DimensionStr } from '@/lib/types.js';
import { computed } from 'vue';

const modelValue = defineModel<DimensionStr | null>({ required: true });
defineProps<{
	id: string
}>();

const boardSizePresets = PRESET_BOARD_SIZES.map(preset => {
	const { type, width, height } = preset;
	const value: DimensionStr = `${width}x${height}`;
	const numCells = width * height;
	return { type, value, numCells };
})
const boardSizeOptions = computed(() => {
	const boardTypeOrdering: Record<BoardType, number> = {
		Normal: 0,
		Rectangular: 1,
		Odd: 2,
	}
	// TODO: add any additional non-preset board-sizes that have been played
	// Sort first by "type" (normal > rect > odd), then by numCells
	return [...boardSizePresets].sort((a, b) => {
		if (a.type !== b.type) {
			return boardTypeOrdering[a.type] - boardTypeOrdering[b.type];
		}
		return a.numCells - b.numCells;
	})
})
</script>