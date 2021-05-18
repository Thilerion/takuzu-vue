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
				></div>
			</transition>
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
		}
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

<style lang="postcss">
.cell-btn, .cell-wrapper, .inner-celll, .touch-anim-el {
	border-radius: var(--cell-rounding)!important;
}

.cell-btn {
	@apply text-xs flex justify-center items-center bg-opacity-0 focus:outline-none;
	width: calc(var(--cell-size) - var(--grid-gap));
	height: calc(var(--cell-size) - var(--grid-gap));
}
.cell-btn:disabled {
	@apply cursor-default;
}

.cell-wrapper {
	@apply h-full w-full relative;
	@apply bg-gray-200 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-50;
}

.cell-value {
	@apply m-auto w-full h-full overflow-hidden absolute inset-0;
	transition: background-color .15s ease;
}
.cell-value.value-1 {
	@apply bg-red-500 dark:bg-red-500 dark:bg-opacity-90;
}
.cell-value.value-0 {
	@apply bg-blue-500 dark:bg-blue-500 dark:bg-opacity-90;
}
.cell-btn:disabled .cell-value.value-1 {
	@apply bg-red-600 dark:bg-red-600 dark:bg-opacity-90;
}
.cell-btn:disabled .cell-value.value-0 {
	@apply bg-blue-600 dark:bg-blue-600 dark:bg-opacity-90;
}

.cell-value-anim-enter-active {
	transition: opacity 0.2s ease;
	z-index: 1;
}
.cell-value-anim-leave-active {
	transition: opacity 0.15s ease;
	z-index: 0;
}
.cell-value-anim-enter-from, .cell-value-anim-leave-to {
	opacity: 0;
}
</style>