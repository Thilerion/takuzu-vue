<template>
	<span class="font-medium" :class="[colorClasses]">{{ symbolString }}</span>
</template>

<script setup lang="ts">
import { ZERO, type PuzzleSymbol, ONE } from '@/lib/constants.js';
import { computed } from 'vue';
import { useDynamicPuzzleSymbolString } from './useDynamicPuzzleSymbolString.js';
import { injectCellThemeData } from '../gameboard/composables/useCellThemeProvider.js';

const props = defineProps<{
	v: PuzzleSymbol,
	mult?: boolean // plural
}>();

const { theme: cellTheme, type: cellThemeType } = injectCellThemeData();

const isColored = computed(() => cellThemeType.value === 'coloredTiles');
const colorClasses = computed(() => {
	if (!isColored.value) return '';
	if (cellTheme.value === 'blue-red') {
		if (props.v === ZERO) {
			return 'text-blue-800'
		} else if (props.v === ONE) {
			return 'text-red-800';
		}
	}
	return '';
})

const { $p } = useDynamicPuzzleSymbolString(
	cellTheme, cellThemeType
);
const symbolString = computed(() => $p(props.v, props.mult));
</script>

<style scoped>

</style>