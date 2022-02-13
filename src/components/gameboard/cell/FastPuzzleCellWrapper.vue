<template>
	<component
		:is="elementType"
		@[eventName]="handleCellToggle"
		class="cell-wrapper relative cell-btn"
		:style="gridStyles"
	>
		<slot
			:value="value"
			:locked="locked"
			:incorrect="incorrect"
		><div class="flex items-center justify-center">{{value}}</div></slot>
	</component>
</template>

<script>
import { computed, toRefs } from "vue";

export default {
	props: [
		'x', 'y', 'locked',
		'initialValue', 'value', 'incorrect'
	],
	emits: ['toggle'],
	setup(props, { emit }) {
		const {
			value,
			x,
			y,
			locked,
			initialValue,
			incorrect
		} = toRefs(props);

		const gridStyles = {
			'grid-row': `${y.value + 1} / span 1`,
			'grid-column': `${x.value + 1} / span 1`
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

		const elementType = isLocked.value ? 'div' : 'button';
		const handleCellToggle = () => {
			emit('toggle', { x: x.value, y: y.value, value: cellValue.value });
		}
		const eventName = isLocked.value ? undefined : 'pointerdown';

		return { elementType, handleCellToggle, eventName, value: cellValue, gridStyles, locked: isLocked, incorrect };
	}
};
</script>

<style>
.cell-wrapper {
	aspect-ratio: 1;
	width: 100%;
	contain: strict;
}

button.cell-wrapper::after {
	content: '';
	@apply w-full h-full absolute z-20 pointer-events-none inset-0 ring ring-gray-800 ring-inset opacity-0 dark:ring-slate-300 dark:ring-2;
	border-radius: calc(var(--cell-rounding) + 0.5px);
	will-change: opacity;
	transition: opacity 0.5s cubic-bezier(.97,.25,.16,.71) .6s;
}
@media (hover:hover) {
	button.cell-wrapper::before {
		content: '';
		@apply w-full h-full absolute z-10 pointer-events-none inset-0 border-2 opacity-0 box-border border-black;
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
	pointer-events: none;
	touch-action: none;
	user-select: none;
}
</style>