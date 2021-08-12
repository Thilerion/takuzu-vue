<template>
	<component
		:is="elementType"
		class="cell-btn colored"
		:class="[`value-${valueString}`]"
	>
		<div class="cell-tap-shadow"></div>
		<slot name="incorrect" />
	</component>
</template>

<script>
import { EMPTY } from '@/lib/constants';
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

<style lang="postcss" scoped>
.cell-btn.colored {
	border-radius: var(--cell-rounded)!important;
	@apply overflow-hidden h-full w-full focus:outline-none relative block;
}

.cell-btn.colored {
	--one-light-normal: hsl(7, 77%, 55%);
	--one-light-locked: hsl(7, 77%, 52%);

	--zero-light-normal: hsl(207, 90%, 61%);
	--zero-light-locked: hsl(207, 96%, 58%);

	--color-one: var(--one-light-normal);
	--color-zero: var(--zero-light-normal);
}

.cell-btn.value-none {
	@apply bg-gray-150;
}

button.cell-btn {
	@apply cursor-pointer;
	transition: background-color .2s ease;
}
button.cell-btn.value-0 {
	background-color: var(--zero-light-normal);
}
button.cell-btn.value-1 {
	background-color: var(--one-light-normal);
}
div.cell-btn.value-0 {
	background-color: var(--zero-light-locked);
}
div.cell-btn.value-1 {
	background-color: var(--one-light-locked);
}

/* Tap active animation */
.cell-tap-shadow {
	@apply pointer-events-none absolute w-full h-full top-0;
	@apply inset-0;
	@apply ring-2 ring-gray-800 dark:ring-white ring-inset ring-opacity-70;
	@apply opacity-0;
}
.cell-size-l .cell-tap-shadow {
	@apply ring;
}
.cell-size-xl .cell-tap-shadow {
	@apply ring-4;
}
.cell-btn:active .cell-tap-shadow {
	@apply opacity-100;
	/* easeOutCirc */
	transition: opacity .05s cubic-bezier(0, 0.55, 0.45, 1);
}
.cell-btn:disabled .cell-tap-shadow {
	@apply ring-0;
}
.cell-tap-shadow {
	transition: opacity 0.5s cubic-bezier(.97,.25,.16,.71) .6s;
}
</style>