<template>
<select
	:id="id"
	v-model="modelValue"
	class="w-full text-sm"
>
	<option :value="null">{{ $t('Statistics.History.filter.any') }}</option>
	<optgroup :label="$t('Game.board-size.normal')">
		<option 
			v-for="opt in boardSizeOptionsByType.Normal"
			:key="opt.value"
			:value="opt.value"
		>{{ opt.value }}</option>
	</optgroup>
	<optgroup :label="$t('Game.board-size.tall')">
		<option 
			v-for="opt in boardSizeOptionsByType.Rectangular"
			:key="opt.value"
			:value="opt.value"
		>{{ opt.value }}</option>
	</optgroup>
	<optgroup :label="$t('Game.board-size.odd')">
		<option 
			v-for="opt in boardSizeOptionsByType.Odd"
			:key="opt.value"
			:value="opt.value"
		>{{ opt.value }}</option>
	</optgroup>
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

const boardSizeOptionsByType = computed(() => {
	const result: Record<BoardType, typeof boardSizePresets> = {
		'Normal': [],
		'Rectangular': [],
		'Odd': [],
	}
	
	for (const preset of boardSizePresets) {
		result[preset.type].push(preset);
	}
	// TODO: add any additional non-preset board-sizes that have been played

	result.Normal.sort((a, b) => a.numCells - b.numCells);
	result.Rectangular.sort((a, b) => a.numCells - b.numCells);
	result.Odd.sort((a, b) => a.numCells - b.numCells);

	return result;
})
</script>