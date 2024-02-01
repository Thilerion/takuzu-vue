<template>
	<div class="main justify-center items-center relative" ref="container">
		<div class="puzzle-wrapper" :class="[`cell-size-${gridGapSizing}`]">
			<slot v-bind="puzzleGridDimensions" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { usePuzzleStore } from '@/stores/puzzle';
import { useThrottledElementSizeObserver } from './composables/useThrottledElementSizeObserver.js';

const props = withDefaults(defineProps<{
	rulerHeight: string,
	rulerWidth: string,
	infoHeight: string,
	paddingX?: string,
	paddingY?: string
}>(), {
	paddingX: "4px",
	paddingY: "6px"
});

const { rulerHeight, rulerWidth, infoHeight, paddingX, paddingY } = toRefs(props);

const container = ref(null);
const pStore = usePuzzleStore();
const rows = computed(() => pStore.height!);
const columns = computed(() => pStore.width!);

const elDimensions = useThrottledElementSizeObserver(
	container,
	{
		delay: 500,
		leading: false,
		trailing: true
	},
	// use sensible defaults
	{
		width: Math.floor(window.screen.availWidth * 0.98),
		height: window.screen.availHeight - 40
	}
);

const rowsWithRuler = computed(() => {
	if (rulerHeight.value === 'cellSize') {
		return rows.value + 1;
	}
	return rows.value;
})
const columnsWithRuler = computed(() => {
	if (rulerWidth.value === 'cellSize') {
		return columns.value + 1;
	}
	return columns.value;
})

const aspectRatio = computed(() => {
	return columnsWithRuler.value / rowsWithRuler.value;
})

function getPxValue(str = '0px'): number {
	const int = parseInt(str.replace('px', ''));
	return Number.isNaN(int) ? 0 : int;
}

const unavailableHeight = computed(() => {
	return [
		rulerHeight.value,
		infoHeight.value,
		paddingY.value,
		paddingY.value
	].reduce((total, pxVal) => {
		if (pxVal === 'cellSize') return total;
		return total + getPxValue(pxVal);
	}, 0)
})
const unavailableWidth = computed(() => {
	return [
		rulerWidth.value,
		paddingX.value,
		paddingX.value
	].reduce((total, pxVal) => {
		if (pxVal === 'cellSize') return total;
		return total + getPxValue(pxVal);
	}, 0)
})

const maxWidth = computed(() => elDimensions.value.width - unavailableWidth.value);
const maxHeight = computed(() => elDimensions.value.height - unavailableHeight.value);

const puzzleGridDimensions = computed(() => {
	const heightA = maxWidth.value / aspectRatio.value;
	if (heightA < maxHeight.value) {
		let cellSize = Math.floor(heightA / rowsWithRuler.value);
		if (cellSize < 12)
			cellSize = 12;
		if (cellSize > 80)
			cellSize = 80;
		const w = cellSize * columns.value;
		const h = cellSize * rows.value;
		return { width: w + "px", height: h + "px", cellSize };
	}
	const widthB = maxHeight.value * aspectRatio.value;
	let cellSize = Math.floor(widthB / columnsWithRuler.value);
	if (cellSize < 12)
		cellSize = 12;
	if (cellSize > 80)
		cellSize = 80;
	const w = cellSize * columns.value;
	const h = cellSize * rows.value;
	return { width: w + "px", height: h + "px", cellSize };
})

const gridGapSizing = computed(() => {
	const { cellSize } = puzzleGridDimensions.value;
	if (cellSize <= 26) {
		return "xs";
	} else if (cellSize <= 38) {
		return "s";
	} else if (cellSize <= 52) {
		return "m";
	} else if (cellSize <= 74) {
		return "l";
	} else {
		return "xl";
	}
});
</script>

<style scoped>
.main {
	@apply flex-1 flex flex-col;
	overflow: hidden;

	--unavail-height: v-bind(unavailableHeight);
	--unavail-width: v-bind(unavailableWidth);
	--rows: v-bind(rows);
	--columns: v-bind(columns);
	--aspect-ratio: calc(var(--columns) / var(--rows));
}

.puzzle-wrapper {
	/* default grid gap for puzzle-grid and rulers */
	--grid-gap: 2px;
	--cell-rounding: 2px;
}

.puzzle-wrapper.cell-size-xs {
	--grid-gap: 1px;
	--cell-rounding: 0px;
}

.puzzle-wrapper.cell-size-s {
	--grid-gap: 1px;
	--cell-rounding: 2px;
}

.puzzle-wrapper.cell-size-m {
	--grid-gap: 2px;
	--cell-rounding: 2px;
}

.puzzle-wrapper.cell-size-l {
	--grid-gap: 3px;
	--cell-rounding: 3px;
}

.puzzle-wrapper.cell-size-xl {
	--grid-gap: 4px;
	--cell-rounding: 4px;
}
</style>