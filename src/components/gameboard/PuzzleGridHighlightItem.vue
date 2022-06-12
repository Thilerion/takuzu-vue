<template>
	<div
		class="highlight"
		:class="{
			'hl-cell': type === HighlightType.CELL,
			'hl-line': type === HighlightType.LINE,
			'hl-area': type === HighlightType.AREA,
			'hl-line-area': type !== HighlightType.CELL,
			primary: level === HighlightLevel.PRIMARY,
			secondary: level === HighlightLevel.SECONDARY
		}"
		:style="[gridAreaStyle]"
	>
		<div class="inner"></div>
	</div>
</template>

<script>
const HL_TYPES = Object.keys(HighlightType);
const HL_LEVELS = Object.keys(HighlightLevel);

export default { HL_TYPES, HL_LEVELS };
</script>

<script setup>
import { HighlightLevel, HighlightType } from '@/stores/hints/highlights/highlight';
import { computed } from 'vue';

const props = defineProps({
	type: {
		validator(v) {
			return HL_TYPES.includes(v);
		},
		required: true
	},
	level: {
		validator(v) {
			return HL_LEVELS.includes(v);
		},
		required: true
	},
	context: Object,
	end: Object,
	start: Object,
	cell: Object
})

const isCellType = computed(() => props.type === HighlightType.CELL);

const cornersToGridArea = (start, end, { width, height }) => {
	const { x: x0, y: y0 } = start;
	const rowSpan = height;
	const colSpan = width;
	return {
		'grid-column': `${x0 + 1} / span ${colSpan}`,
		'grid-row': `${y0 + 1} / span ${rowSpan}`
	};
}
const cellToGridArea = (cell) => {
	const { x, y } = cell;
	return {
		'grid-column': `${x + 1} / span 1`,
		'grid-row': `${y + 1} / span 1`
	}
}

const gridAreaStyle = computed(() => {
	if (isCellType.value) {
		return cellToGridArea(props.cell);
	} else return cornersToGridArea(
		props.start,
		props.end,
		props.context
	)
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
	--inner-pulse-delay: 0.5s;
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