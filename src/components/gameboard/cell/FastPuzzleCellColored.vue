<template>
	<div
		class="cell"
		:class="[valueClass, { locked }, shadeClass]"
	>
		<transition name="cell-color" mode="in-out">
			<div v-if="value === '0'" key="0" class="color-0"></div>
			<div v-else-if="value === '1'" key="1" class="color-1"></div>
		</transition>
		<div class="incorrect-mark" v-if="incorrect"></div>
	</div>
</template>

<script>import { EMPTY } from "@/lib/constants.js";
import { computed, toRefs, Transition } from "vue";

export default {
	props: ['value', 'locked', 'incorrect'],
	components: {
		Transition
	},
	setup(props) {
		const { value, locked, incorrect } = toRefs(props);

		const shade = Math.floor(Math.random() * 5);
		const shadeClass = `shade-${shade}`;

		const valueStr = computed(() => value.value === EMPTY ? 'none' : value.value);
		const valueClass = computed(() => `value-${valueStr.value}`);

		return { valueClass, locked, value, incorrect, shadeClass };
	}
};
</script>

<style scoped>
.cell {
	@apply overflow-hidden relative pointer-events-none text-center;
	@apply w-full h-full;
	@apply bg-gray-150 dark:bg-slate-700;	
	/* contain: strict; */
}
.cell > * {
	border-radius: var(--cell-rounding);
}

.cell-color-enter-active, .cell-color-leave-active {
	transition: opacity 0.25s ease;
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
.shade-0 .color-0 {
	@apply bg-cell-blues;
}
.shade-1 .color-0 {
	@apply bg-cell-blues-v1;
}
.shade-2 .color-0 {
	@apply bg-cell-blues-v2;
}
.shade-3 .color-0 {
	@apply bg-cell-blues-v3;
}
.shade-4 .color-0 {
	@apply bg-cell-blues-v4;
}
.shade-0 .color-1 {
	@apply bg-cell-reds;
}
.shade-1 .color-1 {
	@apply bg-cell-reds-v1;
}
.shade-2 .color-1 {
	@apply bg-cell-reds-v2;
}
.shade-3 .color-1 {
	@apply bg-cell-reds-v3;
}
.shade-4 .color-1 {
	@apply bg-cell-reds-v4;
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
</style>