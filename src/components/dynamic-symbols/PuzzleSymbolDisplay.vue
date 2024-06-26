<template>
<span class="font-medium" :class="[colorClasses]">{{ $t(symbolString) }}</span>
</template>

<script setup lang="ts">
import { ZERO, type PuzzleSymbol, ONE } from '@/lib/constants.js';
import { computed } from 'vue';
import { useDynamicPuzzleSymbolString } from './useDynamicPuzzleSymbolString.js';
import { useCellTheme } from '@/features/board-cell/composables/cell-theme-provider.js';

const props = defineProps<{
	v: PuzzleSymbol,
	mult?: boolean // plural
}>();

const { cellTheme, cellThemeType } = useCellTheme();

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