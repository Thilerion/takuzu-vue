<template>
	<component
		:is="elementType"
		class="cell-btn colored"
		:class="[`value-${valueString}`, locked ? 'locked' : 'btn']"
	>
		<div class="cell-tap-shadow"></div>
		<slot name="incorrect" />
	</component>
</template>

<script>
import { EMPTY } from '@/lib/constants.js';
export default {
	props: {
		locked: Boolean,
		value: {
			type: String,
			required: true
		},
	},
	computed: {
		elementType() {
			if (this.locked) return 'div';
			return 'button';
		},
		valueString() {
			return this.value === EMPTY ? 'none' : this.value;
		}
	},
};
</script>

<style scoped>
.cell-btn.colored {
	border-radius: var(--cell-rounding)!important;
	@apply overflow-hidden h-full w-full focus:outline-none relative block;
}

.cell-btn.value-none {
	@apply bg-gray-150;
}

.cell-btn {
	transition: background-color .2s ease;
}
.cell-btn.btn {
	@apply cursor-pointer;
	will-change: background-color;
}
.cell-btn.value-0 {
	@apply bg-cell-blue-primary;
}
.cell-btn.value-1 {
	@apply bg-cell-red-primary;
}
.cell-btn.locked.value-0 {
	@apply bg-cell-blue-secondary;
}
.cell-btn.locked.value-1 {
	@apply bg-cell-red-secondary;
}

/* Tap active animation */
.cell-tap-shadow {
	@apply pointer-events-none absolute w-full h-full top-0;
	@apply inset-0;
	@apply ring-2 ring-gray-800 dark:ring-white ring-inset ring-opacity-0;
}
.cell-size-l .cell-tap-shadow {
	@apply ring;
}
.cell-size-xl .cell-tap-shadow {
	@apply ring-4;
}
.cell-btn.btn:active .cell-tap-shadow {
	@apply ring-opacity-70;
	/* easeOutCirc */
	transition: box-shadow .05s cubic-bezier(0, 0.55, 0.45, 1);
}
.cell-tap-shadow {
	transition: box-shadow 0.5s cubic-bezier(.97,.25,.16,.71) .6s;
}
</style>