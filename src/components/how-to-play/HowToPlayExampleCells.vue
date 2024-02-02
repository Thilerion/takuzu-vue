<template>
	<div
		class="flex flex-nowrap max-w-full w-full gap-1"
		:style="{
			'--cell-rounding': '0.375rem',
		}"
	>
		<div 
			class="aspect-square flex-auto min-w-4 max-w-16 example-cell"
			v-for="(value, idx) in values"
			:key="idx"
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
import type { PuzzleValueLine } from '@/lib/types.js';
import { injectCellThemeData } from '../gameboard/composables/useCellThemeProvider.js';

const props = withDefaults(defineProps<{
	values: PuzzleValueLine,
	incorrect?: number[], // array of indices of incorrect values
	highlight?: number[], // array of indices of highlighted values
}>(), {
	incorrect: () => ([]),
	highlight: () => ([]),
});

const { cellComponent } = injectCellThemeData();
</script>

<style scoped>
.example-cell {
	container-type: size;
	--base-cell-size: 100cqmin;
}
</style>