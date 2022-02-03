<template>
	<component
		:is="elementType"
		class="cell-btn symbols"
		:class="[`value-${valueString}`, locked ? 'locked' : 'btn', `theme-${theme}`, { incorrect }]"
	>
		<span class="cell-symbol">{{cellSymbol}}</span>
		<div class="cell-tap-shadow"></div>
	</component>
</template>

<script>
import { EMPTY, ONE, ZERO } from '@/lib/constants.js';

const themeSymbols = {
	tictactoe: {
		[ZERO]: 'O',
		[ONE]: 'X',
		[EMPTY]: ''
	},
	binary: {
		[ZERO]: '0',
		[ONE]: '1',
		[EMPTY]: ''
	},
}

export default {
	props: {
		locked: Boolean,
		incorrect: Boolean,
		value: {
			type: String,
			required: true
		},
		theme: {
			type: String,
			default: 'binary'
		}
	},
	data() {
		return {
			themeSymbols
		}
	},
	computed: {
		elementType() {
			if (this.locked) return 'div';
			return 'button';
		},
		valueString() {
			return this.value === EMPTY ? 'none' : this.value;
		},
		currentThemeSymbols() {
			return this.themeSymbols[this.theme];
		},
		cellSymbol() {
			return this.currentThemeSymbols[this.value];
		}
	}
};
</script>

<style scoped>
.cell-btn.symbols {
	border-radius: var(--cell-rounding)!important;
	@apply overflow-hidden h-full w-full focus:outline-none relative text-gray-700 flex;

	--base-cell-size: calc(var(--cell-size) - var(--grid-gap));
}
.cell-btn.btn {
	@apply bg-gray-200 bg-opacity-60;
}
.cell-btn.locked {
	@apply bg-gray-300 bg-opacity-70;
}

.theme-binary {
	@apply font-number;
	--base-size: calc(var(--base-cell-size) - 4px);
	--line-height: calc(var(--base-size) * 1.25);
}
.theme-tictactoe {
	@apply font-sans font-medium;
	--base-size: calc(var(--base-cell-size) - 6px);
	--line-height: calc(var(--base-size) * 1.01);
}

.cell-symbol {
	@apply pointer-events-none m-auto;
	--font-size: clamp(16px, var(--base-size), 48px);
	font-size: var(--font-size);
	line-height: var(--line-height);
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

.cell-btn.btn.incorrect {
	@apply bg-red-400 bg-opacity-20 ring-1 ring-inset ring-red-900 ring-opacity-40;
}
</style>