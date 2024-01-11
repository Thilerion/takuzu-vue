<template>
<div class="puzzle-row-wrapper">
	<PuzzleRowExampleLine v-for="(row, rowIdx) in cellsByRow" :key="rowIdx" :line="row" />
</div>
</template>

<script setup lang="ts">
import { EMPTY, type PuzzleSymbol, type PuzzleValue } from '@/lib/constants';
import type { PuzzleValueLine } from '@/lib/types.js';
import { computed } from 'vue';
import PuzzleRowExampleLine from './PuzzleRowExampleLine.vue';

type Props = {
  values: PuzzleValueLine;
  incorrect?: any[];
  highlight?: any[];
  multirow?: boolean;
  rowlength?: number | null;
};

const props = withDefaults(
  defineProps<Props>(), {
    incorrect: () => ([]),
    highlight: () => ([]),
    multirow: false,
    rowlength: null
  }
);

const size = computed(() => {
	return props.rowlength || props.values.length;
});

const rows = computed(() => {
	if (!props.multirow) return 1;
	return props.values.length / (props.rowlength || size.value);
})

export type PuzzleRowExampleCellData = {
	index: number;
	value: PuzzleValue;
	displayValue: PuzzleSymbol | '';
	valueClass: string;
	incorrect: boolean;
	highlighted: boolean;
}

const cells = computed((): PuzzleRowExampleCellData[] => {
	return Array(props.values.length).fill(null).map((_v, index) => {
		const value = props.values[index];
		const valueName = value === EMPTY ? 'none' : value;
		return {
			index,
			value,
			displayValue: value === EMPTY ? '' : value,
			valueClass: `value-${valueName}`,
			incorrect: props.incorrect.includes(index),
			highlighted: props.highlight.includes(index)
		}
	})
})

const cellsByRow = computed((): PuzzleRowExampleCellData[][] => {
	if (rows.value === 1) return [cells.value];
	const cellsCopy = [...cells.value];
	const byRow: typeof cells.value[] = [];
	for (let i = 0; i < rows.value; i++) {
		const rowCells = cellsCopy.splice(0, size.value);
		byRow.push(rowCells);
	}
	return byRow;
})
</script>

<style scoped>
.puzzle-row-wrapper {
	@apply p-1 border rounded-md border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900;
	--puzzle-row-example-size: v-bind(size);
}


.puzzle-row-wrapper + .puzzle-row-wrapper {
	@apply mt-2;
}
</style>