<template>
	<div
		class="inline-grid grid-rows-1 grid-flow-col gap-1"
		:style="{
			'--cell-rounding': '0.375rem',
			'--cell-size': '1rem'
		}"
	>
		<div 
			class="aspect-square w-10"
			v-for="(value, idx) in values"
			:key="idx"
		>
			<component
				:is="cellComponent"
				:value="value"
				:locked="false"
				:incorrect="true"
			/>				
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PuzzleValueLine } from '@/lib/types.js';
import { useCellThemeProvider } from '../gameboard/composables/useCellThemeProvider.js';

const props = defineProps<{
	values: PuzzleValueLine
}>();

const { cellComponent } = useCellThemeProvider();
</script>

<style scoped>

</style>