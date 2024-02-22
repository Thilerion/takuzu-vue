<template>
	<div
		class="highlight"
		:class="{
			'hl-cell': hlType === HIGHLIGHT_TYPES.CELL,
			'hl-line': hlType === HIGHLIGHT_TYPES.LINE,
			'hl-area': hlType === HIGHLIGHT_TYPES.AREA,
			'hl-line-area': hlType !== HIGHLIGHT_TYPES.CELL,
			primary: level === HIGHLIGHT_LEVELS.PRIMARY,
			secondary: level === HIGHLIGHT_LEVELS.SECONDARY
		}"
		:style="[gridAreaStyle]"
	>
		<div class="inner"></div>
	</div>
</template>

<script setup lang="ts">
import type { BoardShape, Vec } from '@/lib/types.js';
import { HIGHLIGHT_LEVELS, HIGHLIGHT_TYPES } from '@/stores/hints/highlights/highlight';
import type { HighlightLevel, HighlightType } from '@/stores/hints/highlights/types.js';
import { computed } from 'vue';

const props = defineProps<{
	type: HighlightType,
	level: HighlightLevel,
	context?: BoardShape,
	end?: Vec,
	start?: Vec,
	cell?: Vec,
}>();

const hlType = computed(() => props.type);

const isCellType = computed(() => props.type === HIGHLIGHT_TYPES.CELL);
const areaHighlightData = computed(() => {
	if (isCellType.value) return null;
	// data is for line and area highlight
	const shape = props.context!;
	const end = props.end!;
	const start = props.start!;
	return { shape, end, start };
})
const cellHighlightData = computed(() => {
	if (isCellType.value) return { cell: props.cell! };
	return null;
})

const cornersToGridArea = (start: Vec, end: Vec, { width, height }: BoardShape) => {
	const { x: x0, y: y0 } = start;
	const rowSpan = height;
	const colSpan = width;
	return {
		'grid-column': `${x0 + 1} / span ${colSpan}`,
		'grid-row': `${y0 + 1} / span ${rowSpan}`
	};
}
const cellToGridArea = (cell: Vec) => {
	const { x, y } = cell;
	return {
		'grid-column': `${x + 1} / span 1`,
		'grid-row': `${y + 1} / span 1`
	}
}

const gridAreaStyle = computed(() => {
	if (cellHighlightData.value != null) {
		return cellToGridArea(cellHighlightData.value.cell);
	} else if (areaHighlightData.value != null) {
		const { start, end, shape } = areaHighlightData.value;
		return cornersToGridArea(
			start,
			end,
			shape
		)
	} else {
		console.error('Cannot convert highlight data to grid area.');
		return {};
	}
})
</script>

<style scoped>
.highlight.primary {
	--hl-color: 0, 255, 170;
	--inner-opacity: 1;
	--inner-half-opacity: 0.5;
	--inner-pulse-speed: 0.3s;
	--inner-pulse-delay: 0.1s;
}
.highlight.secondary {
	--hl-color: 157, 23, 77;
	--inner-opacity: 0.7;
	--inner-half-opacity: 0.4;
	--inner-pulse-speed: 1.4s;
	--inner-pulse-delay: 0.25s;
}

.hl-cell {
	--hint-size: 4px;
	--hint-outside: calc(var(--hint-size) * -0.5);
	--zoom-distance: 1.5, 1.5, 1.5;
	box-shadow: 0 0 6px -1px rgba(var(--hl-color), 0.8);

	@apply absolute z-10 pointer-events-none animate-pulse;

	left: var(--hint-outside);
	top: var(--hint-outside);
	width: calc(100% + var(--hint-size));
	height: calc(100% + var(--hint-size));
	grid-row: calc(var(--y) + 1) / span 1;
	grid-column: calc(var(--x) + 1) / span 1;
	border-radius: var(--cell-rounding);
}

.hl-line-area {
	--hint-size: 6px;
	--hint-outside: calc(var(--hint-size) * -0.5);
	--zoom-distance: 1.05, 1.05, 1.05;
	box-shadow: 0 0 4px -1px rgba(var(--hl-color), 1);
	@apply absolute z-10 pointer-events-none animate-pulse;

	left: var(--hint-outside);
	top: var(--hint-outside);
	width: calc(100% + var(--hint-size));
	height: calc(100% + var(--hint-size));
	border-radius: var(--cell-rounding);
}

.primary.hl-line-area {
	/* @apply duration-1000; */
	box-shadow: 0 0 7px -1px rgba(var(--hl-color), 1);
}
.secondary {
	/* @apply duration-[2000ms]; */
	animation-duration: 5000s;
}

.inner {
	@apply w-full h-full ring-2 ring-inset ring-emerald-800;
	border-radius: var(--cell-rounding);
	animation: zoomAnim var(--inner-pulse-speed) ease-in-out var(--inner-pulse-delay) forwards;
	opacity: 0;
}
.secondary .inner {
	@apply ring-inset ring-pink-800;
}

@keyframes zoomAnim {
	0% {
		opacity: 0;
		transform: scale3d(var(--zoom-distance));
	}
	30% {
		opacity: var(--inner-half-opacity);
	}
	100% {
		transform: scale3d(1, 1, 1);
		opacity: var(--inner-opacity);
	}
}
</style>