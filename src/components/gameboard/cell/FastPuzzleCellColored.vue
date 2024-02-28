<template>
	<div
		class="cell"
		:class="[valueClass, { locked }]"
		:data-shade="shade"
		:data-shade-type="shadeType"
	>
		<transition
			name="cell-color"
			mode="in-out"
		>
			<div
				class="cell-color-bg cell-inner-color"
				:class="[value === ZERO ? 'color-0' : 'color-1']"
				:key="value"
				v-if="value !== EMPTY"
			></div>
		</transition>
		<div class="incorrect-mark" v-if="incorrect"></div>
		<div class="highlight-mark" v-if="highlighted"></div>
	</div>
</template>

<script setup lang="ts">
import { EMPTY, ZERO, type PuzzleValue } from "@/lib/constants";
import { watch } from "vue";
import { ref } from "vue";
import { computed, toRefs } from "vue";

const props = defineProps<{
	value: PuzzleValue,
	locked?: boolean,
	incorrect?: boolean,
	highlighted?: boolean,
}>()

const { value } = toRefs(props);

const rndShadeIdx = Math.floor(Math.random() * 9) - 4;
const shade = Math.abs(rndShadeIdx);
const shadeType = rndShadeIdx < 0 ? 'lighten' : 'darken';

const valueStr = computed(() => value.value === EMPTY ? 'none' : value.value);
const valueClass = computed(() => `value-${valueStr.value}`);

// transition from empty to a color is shorter, so the initial cell tap feels more responsive
const enterDuration = ref<`${number}ms`>('250ms');
watch(value, (to, from) => {
	if (to !== EMPTY && from === EMPTY) {
		enterDuration.value = '80ms';
	} else {
		enterDuration.value = '250ms';
	}
})
</script>

<style scoped>
.cell {
	@apply overflow-hidden relative isolate pointer-events-none text-center;
	@apply w-full h-full;
	@apply bg-gray-125 dark:bg-slate-800;
}
.cell > *, .cell {
	border-radius: var(--cell-rounding);
}

.cell-color-enter-active {
	transition: opacity v-bind(enterDuration) ease;
	z-index: 1;
}
.cell-color-leave-active {
	transition: opacity 0.25s ease;
	z-index: 0;
}
.cell-color-enter-from, .cell-color-leave-to {
	opacity: 0;
}

.cell-color-bg {
	@apply w-full h-full absolute;
}

.color-0 {
	--base-color: theme('colors.cell.blue.primary');
}
.color-1 {
	--base-color: theme('colors.cell.red.primary');
}
[data-shade-type="darken"] {
	--mix-0: theme('colors.cell.blue.dark');
	--mix-1: theme('colors.cell.red.dark');
}
[data-shade-type="lighten"] {
	--mix-0: theme('colors.cell.blue.light');
	--mix-1: theme('colors.cell.red.light');
}
.color-0 {
	--mix-color: var(--mix-0);
}
.color-1 {
	--mix-color: var(--mix-1);
}
[data-shade="0"] {
	--mix-p: 0%;
}
[data-shade="1"] {
	--mix-p: 15%;
}
[data-shade="2"] {
	--mix-p: 22%;
}
[data-shade="3"] {
	--mix-p: 30%;
}
[data-shade="4"] {
	--mix-p: 40%;
}
.cell-color-bg {
	background-color: color-mix(in srgb, var(--base-color), var(--mix-color) var(--mix-p));
}

.incorrect-mark {
	pointer-events: none;
	@apply absolute inset-0 z-10;
     background: 
         linear-gradient(to top left,
             rgba(0,0,0,0) 0%,
             rgba(0,0,0,0) calc(50% - 0.8px),
             rgba(0,0,0,1) 50%,
             rgba(0,0,0,0) calc(50% + 0.8px),
             rgba(0,0,0,0) 100%),
         linear-gradient(to top right,
             rgba(0,0,0,0) 0%,
             rgba(0,0,0,0) calc(50% - 0.8px),
             rgba(0,0,0,1) 50%,
             rgba(0,0,0,0) calc(50% + 0.8px),
             rgba(0,0,0,0) 100%);
}

.highlight-mark {
	@apply w-[3px] h-[3px] rounded-full bg-black/50 absolute left-[4px] top-[4px] z-10;
}
</style>