<template>
<div class="puzzle-row-wrapper">
	<div class="puzzle-row" v-for="row in cellsByRow" :key="row.index">
		<div
			class="puzzle-cell"
			:class="[cell.valueClass, { highlight: cell.highlighted, incorrect: cell.incorrect }]"
			v-for="cell in row"
			:key="`${row.index} ${cell.index}`"
		>{{cell.displayValue}}</div>
	</div>
</div>
</template>

<script setup>
import { EMPTY } from '@/lib/constants';
import { computed } from 'vue';

const props = defineProps({
	values: {
		type: Array,
		required: true
	},
	incorrect: {
		type: Array,
		default: () => ([])
	},
	highlight: {
		type: Array,
		default: () => ([])
	},
	multirow: {
		type: Boolean
	},
	rowlength: {
		type: Number
	}
})

const size = computed(() => props.rowlength ?? props.values.length);

const rows = computed(() => {
	if (!props.multirow) return 1;
	return props.values.length / props.rowlength;
})

const cells = computed(() => {
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

const cellsByRow = computed(() => {
	if (rows.value === 1) return [cells.value];
	const cellsCopy = [...cells.value];
	const byRow = [];
	for (let i = 0; i < rows.value; i++) {
		const rowCells = cellsCopy.splice(0, size.value);
		byRow.push(rowCells);
	}
	return byRow;
})
</script>

<style scoped>
.puzzle-row-wrapper {
	@apply p-1 border rounded-md border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900
}

.puzzle-row {
	@apply flex max-w-full;
	gap: 4px;
	line-height: 1;
	max-width: 500px;
}
.puzzle-row + .puzzle-row {
	@apply mt-1;
}
.puzzle-row-wrapper + .puzzle-row-wrapper {
	@apply mt-2;
}
.puzzle-cell {
	@apply aspect-square flex-1 rounded flex items-center justify-center;
	@apply bg-gray-150 dark:bg-gray-300/20;
	max-width: 3rem;
	font-size: clamp(8px, calc(((95vw - 5.5rem) / v-bind(size)) - 10px), 2.5rem);
}

:not(.dark) .puzzle-cell {
	--base-text-lightness: 43%;
	--text-blue-sat: 60%;
	--text-red-sat: 60%;
}
.dark .puzzle-cell {
	--base-text-lightness: 90%;
	--text-blue-sat: 80%;
	--text-red-sat: 60%;
}
.puzzle-cell.value-0 {
	/* @apply text-cell-blue-primary; */
	color: hsl(207 var(--text-blue-sat) var(--base-text-lightness));
}
.puzzle-cell.value-1 {
	/* @apply text-cell-red-primary; */
	color: hsl(7 var(--text-red-sat) var(--base-text-lightness));
}

.puzzle-cell.highlight {
	@apply ring-2 ring-inset dark:ring-gray-300/50 ring-gray-400;
}
.puzzle-cell.incorrect {
	@apply ring-2 dark:ring-red-300/50 ring-red-600/40 ring-inset;
	@apply bg-red-200/20 dark:bg-red-300/20;
}
</style>