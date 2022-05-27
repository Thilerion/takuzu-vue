<template>
	<div
		class="ruler grid leading-none place-items-center gap-[--grip-gap]"
		:data-ruler-dir="props.lineType"
	>
		<CountsRulerCell
			v-for="({ index, one, zero, complete }) in countCellData"
			:key="index"
			:type="countType"
			v-bind="{ one, zero, complete }"
		/>
	</div>
</template>

<script setup>
import { COLUMN, ONE, ROW, ZERO } from '@/lib/constants';
import { usePuzzleStore } from '@/stores/puzzle';
import { watchDebounced } from '@vueuse/core';
import { computed, onBeforeMount, ref, toRefs } from 'vue';

const props = defineProps({
	lineType: {
		type: String,
		required: true
	},
	counts: {
		type: Array,
		required: true
	},
	countType: {
		validator(value) {
			return value === 'remaining' || value === 'current';
		},
		required: true
	},
	cellSize: {
		type: Number,
		required: true
	}
})
const { counts, countType } = toRefs(props);
const puzzleStore = usePuzzleStore();
const numRequired = computed(() => {
	return puzzleStore.board?.numRequired;
})
const lineRequired = computed(() => {
	const key = props.lineType === 'rows' ? ROW : COLUMN;
	const values = numRequired.value?.[key];
	if (!values) {
		return [
			Math.floor(props.counts.length / 2),
			Math.ceil(props.counts.length / 2),
		]
	}
	const { [ZERO]: zero, [ONE]: one } = values;
	return [zero, one];
})
const countCellData = ref([]);

const parseCellData = (counts) => {
	const [reqZero, reqOne] = lineRequired.value;
	return counts.map((c, i) => {
		const {
			[ZERO]: zeroCur,
			[ONE]: oneCur
		} = c;
		const zeroRem = reqZero - zeroCur;
		const oneRem = reqOne - oneCur;
		const zero = {
			current: zeroCur,
			remaining: zeroRem,
			error: zeroCur > reqZero,
			complete: zeroRem === 0,
		}
		const one = {
			current: oneCur,
			remaining: oneRem,
			error: oneCur > reqOne,
			complete: oneRem === 0
		}
		const complete = zero.complete && one.complete;
		return { zero, one, complete, index: i };
	})
}
onBeforeMount(() => {
	countCellData.value = parseCellData(counts.value);
})
const DEBOUNCE_DURATION = 180;
const MAX_WAIT = Math.floor(DEBOUNCE_DURATION * 2.2);
watchDebounced([counts, countType], ([countVal]) => {
	try {
		countCellData.value = parseCellData(countVal);
	} catch(e) {
		console.warn(e);
		countCellData.value = [];
	}
}, { debounce: DEBOUNCE_DURATION, maxWait: MAX_WAIT, immediate: true, deep: true })

const cellPadding = computed(() => {
	if (props.cellSize > 40) {
		return '14%';
	} else if (props.cellSize > 32) {
		return '13%';
	} else if (props.cellSize > 27) {
		return '4px';
	} else {
		return '2px';
	}
})
</script>

<style scoped>
.ruler {
	--ruler-cell-size: calc(var(--cell-size) - var(--grid-gap));
	--half-size: calc(var(--cell-size) / 4);
	--font-size: clamp(10px, var(--half-size), 2rem);
	--cell-padding: v-bind(cellPadding);

	font-size: var(--font-size);

	@apply pointer-events-none touch-none;
}

[data-ruler-dir="rows"] {
	width: var(--ruler-cell-size);
	@apply h-full flex-col;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: 1fr;
}
[data-ruler-dir="columns"] {
	height: var(--ruler-cell-size);
	@apply w-full flex-row;
	grid-template-columns: repeat(var(--columns), 1fr);
	grid-template-rows: 1fr;
}
</style>