<template>
<span class="font-medium" :class="[colorClasses]">{{ $t(symbolString) }}</span>
</template>

<script setup lang="ts">
import { ZERO, type PuzzleSymbol, ONE } from '@/lib/constants.js';
import { computed } from 'vue';
import { injectCellThemeData } from '../gameboard/composables/useCellThemeProvider.js';
import { useDynamicPuzzleSymbolString } from './useDynamicPuzzleSymbolString.js';

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
			return 'text-cell-blue-primary dark:text-cell-blue-lighter'
		} else if (props.v === ONE) {
			return 'text-cell-red-primary dark:text-cell-red-lighter';
		}
	}
	return '';
})

const { $p } = useDynamicPuzzleSymbolString(
	cellTheme, cellThemeType
);
const symbolString = computed(() => $p(props.v, props.mult));
</script>