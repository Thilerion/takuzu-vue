<template>
	<component
		:is="elementType"
		@[eventName]="handleCellToggle"
		class="cell-wrapper relative cell-btn aspect-square w-full touch-none"
		:style="gridStyles"
	>
		<slot
			:value="cellValue"
			:locked="isLocked"
			:incorrect="incorrect"
		><div class="flex items-center justify-center">{{cellValue}}</div></slot>
	</component>
</template>

<script setup lang="ts">
import type { PuzzleValue } from "@/lib/constants.js";
import type { VecValue } from "@/lib/types.js";
import { computed, ref, toRefs, watch } from "vue";

const props = defineProps<{
	x: number,
	y: number,
	locked: boolean,
	initialValue: PuzzleValue,
	value: PuzzleValue,
	incorrect: boolean | undefined
}>();
const emit = defineEmits<{
	toggle: [toggleTarget: VecValue]
}>();

const {
	value,
	x,
	y,
	locked,
	initialValue,
	incorrect
} = toRefs(props);

const gridStyles = {
	'grid-row': `cell-row-start ${y.value + 1} / span 1`,
	'grid-column': `cell-col-start ${x.value + 1} / span 1`
};

const cellValue = computed(() => {
	if (value.value == null) {
		return initialValue.value;
	} else return value.value;
})
const isLocked = computed(() => {
	if (locked.value == null) {
		return initialValue.value !== '.';
	} else return locked.value;
})

const elementType = ref(isLocked.value ? 'div' : 'button');
const eventName = ref(isLocked.value ? undefined : 'pointerdown');

watch(isLocked, (v, prev) => {
	if (v === prev) return;
	elementType.value = v ? 'div' : 'button';
	eventName.value = v ? undefined : 'pointerdown';
})

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

button.cell-wrapper::after {
	content: '';
	@apply w-full h-full absolute z-20 pointer-events-none inset-0 ring ring-gray-800 ring-inset opacity-0 dark:ring-slate-300 dark:ring-2;
	border-radius: calc(var(--cell-rounding) + 0.5px);
	will-change: opacity;
	transition: opacity 0.5s cubic-bezier(.97,.25,.16,.71) .6s;
}
/* Todo: hover and pointer fine? What is the purpose of this again? */
@media (hover:hover) and (pointer: fine) {
	button.cell-wrapper::before {
		content: '';
		@apply w-full h-full absolute z-10 pointer-events-none inset-0 border-2 opacity-0 box-border border-black;
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

.cell-wrapper::slotted(*) {
	@apply pointer-events-none touch-none select-none;
}
</style>