<template>
<component
	:is="elementType"
	class="cell-wrapper relative cell-btn aspect-square w-full touch-none"
	:style="gridStyles"
	@[eventName]="handleCellToggle"
>
	<slot
		:value="cellValue"
		:locked="isLocked"
		:incorrect="incorrect"
	><div class="flex items-center justify-center">{{ cellValue }}</div></slot>
</component>
</template>

<script setup lang="ts">
import type { PuzzleValue } from "@/lib/constants.js";
import type { VecValue } from "@/lib/types.js";
import { toRefs } from "vue";

const props = defineProps<{
	x: number,
	y: number,
	locked: boolean,
	// initialValue: PuzzleValue,
	value: PuzzleValue,
	incorrect: boolean | undefined
}>();
const emit = defineEmits<{
	toggle: [toggleTarget: VecValue]
}>();

const {
	x,
	y,
	value: cellValue,
	incorrect
} = toRefs(props);

const gridStyles = {
	'grid-row': `cell-row-start ${y.value + 1} / span 1`,
	'grid-column': `cell-col-start ${x.value + 1} / span 1`
};

// Fixed values. The PuzzleGrid component is destroyed and recreated when the puzzle changes, so this component is always fresh when isLocked for a specific x,y gets a different value
const isLocked = props.locked;
const elementType = isLocked ? 'div' : 'button';
const eventName = isLocked ? undefined : 'pointerdown';

const handleCellToggle = () => {
	emit('toggle', { x: x.value, y: y.value, value: cellValue.value });
}
</script>

<style>
.cell-wrapper {
	contain: strict;
	container-type: size;
	--base-cell-size: 100cqmin;
}

/* ----- CELL-WRAPPER ::AFTER => FADING RING ON CELL TOGGLE ----- */
button.cell-wrapper::after {
	content: '';
	@apply w-full h-full absolute z-20 pointer-events-none inset-0 ring ring-gray-800 ring-inset opacity-0 dark:ring-slate-300 dark:ring-2;
	border-radius: calc(var(--cell-rounding) + 0.5px);
	will-change: opacity;
	transition: opacity 0.5s cubic-bezier(.97,.25,.16,.71) .6s;
}
button.cell-wrapper:active::after {
	opacity: 0.7;
	transition: opacity .05s cubic-bezier(0, 0.55, 0.45, 1);
}
.cell-size-xs button.cell-wrapper::after,
.cell-size-s button.cell-wrapper::after,
.cell-size-m button.cell-wrapper::after {
	@apply ring-2 dark:ring-1;
}
.cell-size-l button.cell-wrapper::after {
	@apply ring dark:ring-2;
}
.cell-size-xl button.cell-wrapper::after {
	@apply ring-4 dark:ring;
}

/* ----- CELL-WRAPPER ::BEFORE => SMALL RING HOVER STYLING (only when device supports hover) */
@media (hover:hover) and (pointer: fine) {
	button.cell-wrapper::before {
		content: '';
		@apply w-full h-full absolute z-10 pointer-events-none inset-0 border-2 opacity-0 box-border border-black dark:border-white;
		border-radius: calc(var(--cell-rounding) + 0.5px);
		will-change: opacity;
		transition: opacity 0.2s ease;
	}
	button.cell-wrapper:hover::before {
		@apply opacity-30;
		transition: opacity 0.2s ease;
	}
	button.cell-wrapper:active::before {
		@apply opacity-70;
		transition: opacity 1s ease;
	}
}

.cell-wrapper > * {
	@apply pointer-events-none touch-none select-none;
}
</style>