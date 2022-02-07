<template>
	<div
		class="cell"
		:class="[valueClass, { locked }]"
	>
		<transition name="cell-color" mode="in-out">
			<div v-if="value === '0'" key="0" class="color-0"></div>
			<div v-else-if="value === '1'" key="1" class="color-1"></div>
		</transition>
		<div class="cell-tap-shadow"></div>
	</div>
</template>

<script>import { EMPTY } from "@/lib/constants.js";
import { computed, toRefs, Transition } from "vue";

export default {
	props: ['value', 'locked'],
	components: {
		Transition
	},
	setup(props) {
		const { value, locked } = toRefs(props);

		const valueStr = computed(() => value.value === EMPTY ? 'none' : value.value);
		const valueClass = computed(() => `value-${valueStr.value}`);

		return { valueClass, locked, value };
	}
};
</script>

<style>
.cell {
	@apply overflow-hidden relative pointer-events-none text-center;
	@apply w-full h-full;
	@apply bg-gray-150;	
	contain: strict;
}
.cell > * {
	border-radius: var(--cell-rounding);
}

.cell-color-enter-active, .cell-color-leave-active {
	transition: opacity 0.5s ease;
}
.cell-color-enter-from, .cell-color-leave-to {
	opacity: 0;
}
.cell-color-leave-active {
	z-index: 0;
}
.cell-color-enter-active {
	z-index: 1;
}

.color-0, .color-1 {
	@apply w-full h-full absolute;
}
.color-0 {
	@apply bg-cell-blue-primary;
}
.color-1 {
	@apply bg-cell-red-primary;
}
</style>

<style>
.cell-tap-shadow {
	@apply pointer-events-none absolute inset-0;
	@apply ring ring-gray-800 ring-inset;
	z-index: 2;
	opacity: 0;
	border-radius: calc(var(--cell-rounding) + 0.5px);
	will-change: opacity;
	transition: opacity 0.5s cubic-bezier(.97,.25,.16,.71) .6s;
}
.cell-btn:active > .cell > .cell-tap-shadow {
	opacity: 0.7;
	transition: opacity .05s cubic-bezier(0, 0.55, 0.45, 1);
}

.cell-size-xs .cell-tap-shadow,
.cell-size-s .cell-tap-shadow,
.cell-size-m .cell-tap-shadow {
	@apply ring-2;
}
.cell-size-l .cell-tap-shadow {
	@apply ring;
}
.cell-size-xl .cell-tap-shadow {
	@apply ring-4;
}
</style>