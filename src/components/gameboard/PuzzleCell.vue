<template>
	<button
		class="cell-btn"
		@pointerdown="cellClickHandler"
		:disabled="locked"
	>
		<div class="cell-wrapper">
			<transition name="cell-value-anim">
				<div
					v-if="hasValue"
					class="cell-value"
					:class="cellValueClassList"
				><div class="cell-symbol">{{cellSymbol}}</div></div>
			</transition>
			<div class="cell-tap-shadow"></div>
		</div>
	</button>
</template>

<script>
import { EMPTY, ONE, ZERO } from '@/lib/constants';
export default {
	props: {
		x: {
			type: Number,
			required: true
		},
		y: {
			type: Number,
			required: true
		},
		value: {
			type: String,
			validator(value) {
				return [ONE, ZERO, EMPTY].includes(value);
			}
		},
		theme: {
			type: String,
			required: true
		},
		hidden: Boolean
	},
	emits: ['click'],
	computed: {
		hasValue() {
			return this.value !== EMPTY;
		},
		locked() {
			return this.$store.state.puzzle.initialBoard.grid[this.y][this.x] !== EMPTY;
		},
		cellValueClassList() {
			const list = [];
			if (this.hasValue) list.push(`value-${this.value}`);
			return list;
		},
		cellSymbol() {
			if (this.theme === 'colored' || this.value == null || this.value === EMPTY) {
				return '';
			}

			if (this.value === ONE) {
				return this.theme === 'tictactoe' ? 'X' : '1';
			} else if (this.value === ZERO) {
				return this.theme === 'binary' ? '0' : 'O';
			}
			return '';
		}
	},
	methods: {
		cellClickHandler() {
			if (this.locked) return;
			const { x, y, value } = this;
			this.$emit('click', { x, y, value });
		}
	}
};
</script>

<style lang="postcss" scoped>
.cell-btn {
	--one-light-normal: hsl(7, 77%, 55%);
	--one-light-locked: hsl(7, 77%, 52%);

	--zero-light-normal: hsl(207, 90%, 61%);
	--zero-light-locked: hsl(207, 96%, 58%);

	--color-one: var(--one-light-normal);
	--color-zero: var(--zero-light-normal);
}
.cell-btn:disabled {
	--color-one: var(--one-light-locked);
	--color-zero: var(--zero-light-locked);
}

.cell-btn, .cell-wrapper, .cell-value, .cell-tap-shadow {
	border-radius: var(--cell-rounding)!important;
}

.cell-btn {
	@apply flex justify-center items-center bg-opacity-0 focus:outline-none;
	width: calc(var(--cell-size) - var(--grid-gap));
	height: calc(var(--cell-size) - var(--grid-gap));
}
.cell-theme-binary .cell-btn {
	@apply font-number text-gray-700;
}
.cell-theme-tictactoe .cell-btn {
	@apply font-sans font-medium text-gray-700;
}
.cell-theme-colored .cell-btn {
	@apply text-white;
}
.cell-btn:disabled {
	@apply cursor-default;
}
.cell-theme-binary .cell-btn:disabled .cell-wrapper,
.cell-theme-tictactoe .cell-btn:disabled .cell-wrapper {
	@apply bg-gray-300 bg-opacity-70 dark:bg-gray-700 dark:bg-opacity-30;
}

.cell-wrapper {
	@apply h-full w-full relative;
	@apply bg-gray-200 bg-opacity-60 dark:bg-gray-700 dark:bg-opacity-50;
}

/* Tap active animation */
.cell-tap-shadow {
	@apply pointer-events-none absolute;
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
	transition: opacity .1s cubic-bezier(0, 0.55, 0.45, 1);
}
.cell-btn:disabled .cell-tap-shadow {
	@apply ring-0;
}
.cell-tap-shadow {
	transition: opacity 2s cubic-bezier(.97,.25,.16,.71) .15s;
}
/* END Tap active animation */

.cell-value {
	@apply m-auto w-full h-full overflow-hidden absolute inset-0 opacity-100 flex;
	transition: background-color .15s ease, opacity .15s ease;
}
.cell-value.value-1 {
	background-color: var(--color-one);
}
.cell-value.value-0 {
	background-color: var(--color-zero);
}

.cell-value-anim-enter-active {
	transition: opacity 0.2s ease;
}
.cell-value-anim-leave-active {
	transition: opacity 0.25s ease;
}
.cell-value-anim-enter-from, .cell-value-anim-leave-to {
	opacity: 0;
}

.cell-symbol {
	@apply pointer-events-none m-auto inline-block;
	
	--base-size: calc(var(--cell-size) - var(--grid-gap));
	--base-cell-font-size: calc(var(--base-size) - 4px);
	--cell-font-size: clamp(16px, var(--base-cell-font-size), 48px);

	font-size: var(--cell-font-size);
	line-height: calc(var(--base-size) * 1.1);
}
.cell-theme-tictactoe .cell-symbol {
	--base-cell-font-size: calc(var(--base-size) - 6px);
	line-height: calc(var(--base-size) * 1.01);
}

.cell-theme-binary .cell-value, .cell-theme-tictactoe .cell-value {
	background-color: transparent;
}
</style>