<template>
<div
	class="ruler-cell"
	:class="{ 'line-complete': complete, 'line-partly-complete': zero.complete || one.complete }"
>
	<div class="count zero" :class="{'cell-complete': zero.complete, error: zero.error}">{{ valueZero }}</div>
	<div class="count-divider"></div>
	<div class="count one" :class="{'cell-complete': one.complete, error: one.error}">{{ valueOne }}</div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RulerCountType } from './CountsRuler.vue';
import type { RulerPuzzleSymbolCountData } from './useRulerCellCountData.js';

const props = defineProps<{
	zero: RulerPuzzleSymbolCountData,
	one: RulerPuzzleSymbolCountData,
	type: RulerCountType,
	complete?: boolean
}>()

const valueZero = computed(() => props.zero[props.type]);
const valueOne = computed(() => props.one[props.type]);
</script>

<style scoped>

.ruler-cell {
	@apply touch-none pointer-events-none;
	grid-template-rows: repeat(3, 1fr);
	grid-template-columns: repeat(3, 1fr);
	@apply grid leading-none overflow-hidden relative transition-colors font-sans justify-items-stretch items-stretch pointer-events-auto select-none;
	width: var(--ruler-cell-size);
	height: var(--ruler-cell-size);

	@apply text-gray-600 dark:text-slate-300;
	--half-size: calc(var(--ruler-cell-size) * 0.3);
	--font-size: clamp(10px, var(--half-size), 2rem);
	--base-padding: calc(0.13 * var(--ruler-cell-size));
	--min-padding: 0px;
	padding: var(--cell-padding, 2px);
	font-size: var(--font-size);
}

.count, .count-divider {
	@apply transition-colors;
}

.count {
	@apply w-[1.5ch] relative;
}

.count.zero {
	@apply row-start-1 row-span-2 col-span-2 col-start-1 mb-auto text-right;
}
.count.one {
	@apply row-start-2 col-start-2 row-span-2 col-span-2 text-right mt-auto ml-auto;
}
.count-divider {
	@apply w-px h-3/5 bg-gray-400 dark:bg-slate-500 row-start-1 row-span-3 col-start-1 col-span-3 rotate-[50deg] origin-center place-self-center left-[5%] relative;
}
.line-partly-complete .count-divider, .line-complete .count-divider {
	@apply bg-gray-300 dark:bg-slate-300/30;
}

.cell-complete {
	@apply text-gray-300 dark:text-slate-300/30;
}

[data-play-state="paused"] .count {
	@apply relative invisible;
	@apply after:absolute after:h-full after:inset-0 after:bg-gray-200 dark:after:bg-slate-600 after:visible;
}
[data-play-state="paused"] .count-divider {
	@apply bg-gray-300 dark:bg-slate-600 transition-none;
}


.count.error {
/*
	when count becomes error, set color with a delay
	when becomes correct again, no transition
	*/
	transition: color .15s ease-out;
	animation: headShake 1s ease-in-out 2s;
	animation-fill-mode: forwards;
	@apply text-red-700 dark:text-red-500;
}


.animate__headShake {
	animation-timing-function: ease-in-out;
	animation-name: headShake;
}
@keyframes headShake {
	0% {
		transform: translateX(0);
		font-weight: normal;
	}

	6.5% {
		transform: translateX(-1.5px) rotateY(-9deg);
	}

	18.5% {
		transform: translateX(1px) rotateY(7deg);
		font-weight: 600;
	}

	31.5% {
		transform: translateX(-0.75px) rotateY(-5deg);

	}

	43.5% {
		transform: translateX(0.6px) rotateY(3deg);
	}

	50% {
		transform: translateX(0);
	}

	100% {
		transform: translateX(0) rotateY(0deg);
		font-weight: 600;
	}
}
</style>