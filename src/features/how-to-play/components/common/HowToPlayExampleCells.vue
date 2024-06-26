<template>
<div
	class="flex flex-nowrap max-w-full w-full gap-1"
	:style="{
		'--cell-rounding': '0.375rem',
	}"
>
	<div 
		v-for="(value, idx) in values"
		:key="idx"
		class="aspect-square flex-auto min-w-4 max-w-12 example-cell"
	>
		<component
			:is="cellComponent"
			:value="value"
			:locked="false"
			:incorrect="incorrect.includes(idx)"
			:highlighted="highlight.includes(idx)"
		/>				
	</div>
</div>
</template>

<script setup lang="ts">
import { useCellTheme } from '@/features/board-cell/composables/cell-theme-provider.js';
import { useCurrentCellComponent } from '@/features/board-cell/composables/current-cell-component.js';
import type { PuzzleValueLine } from '@/lib/types.js';

const props = withDefaults(defineProps<{
	values: PuzzleValueLine,
	incorrect?: number[], // array of indices of incorrect values
	highlight?: number[], // array of indices of highlighted values
}>(), {
	incorrect: () => ([]),
	highlight: () => ([]),
});

const { cellThemeType: themeType } = useCellTheme();
const cellComponent = useCurrentCellComponent(themeType);
</script>

<style scoped>
.example-cell {
	container-type: size;
	--base-cell-size: 100cqmin;
}
</style>