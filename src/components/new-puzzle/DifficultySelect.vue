<template>
	<div
		class="difficulty-select grid pb-1 pt-2 px-0 overflow-hidden relative grid-rows-2"
	>
		<button
			@click="$emit('decrease')"
			class="arrow-left z-10"
		><icon-ic-baseline-keyboard-arrow-left :style="{'font-size': '24px'}"/></button>
		<div class="label h-16 relative z-0 mt-1">
			<transition :name="transitionName">
				<DifficultyLabel
					:stars="difficulty"
					:label="currentLabel"
					:key="difficulty"
				/>
			</transition>
		</div>
		<button
			@click="$emit('increase')"
			class="arrow-right z-10"
		><icon-ic-baseline-keyboard-arrow-right :style="{'font-size': '24px'}"/></button>
	</div>
</template>

<script setup lang="ts">
import type { DifficultyKey } from '@/lib/types.js';
import { computed, ref, toRef, watch } from 'vue';

type DifficultySelectProps = {
	labels: Record<DifficultyKey, string>,
	difficulty: DifficultyKey
}

const props = defineProps<DifficultySelectProps>();
const emit = defineEmits<{
	increase: [],
	decrease: []
}>();

const difficulty = toRef(props, 'difficulty');

const currentLabel = computed(() => {
	return props.labels[props.difficulty];
})

const transitionName = ref('slide-right');

watch(difficulty, (cur, prev) => {
	const increase = cur > prev;
	const distance = Math.abs(cur - prev);
	const isFar = distance > 1;

	if (!isFar) {
		if (increase) {
			transitionName.value = 'slide-right';
		}  else {
			transitionName.value = 'slide-left';
		}
	} else {
		if (increase) {
			transitionName.value = 'slide-far-right';
		} else {
			transitionName.value = 'slide-far-left';
		}
	}
})
</script>

<style scoped>
.difficulty-select {
	@apply grid;
	grid-template-rows: 2fr 2fr;
	grid-template-columns: 2rem 2rem auto 2rem 2rem;
}

.arrow-left {
	grid-column: 1 / span 2;
	grid-row: 1 / span 2;
	align-self: stretch;
	@apply pl-2;
}
.arrow-right {
	grid-column: 4 / span 2;
	grid-row: 1 / span 2;
	align-self: stretch;
	@apply pr-2;
}

.arrow-left > * {
	@apply mr-auto;
}
.arrow-right > * {
	@apply ml-auto;
}

.label {
	grid-row: 1 / span 2;
	grid-column: 2 / span 3;
}

.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active,
.slide-far-left-enter-active, .slide-far-left-leave-active,
.slide-far-right-enter-active, .slide-far-right-leave-active {
	transition: all .5s ease;
}
.slide-left-enter-active, .slide-right-enter-active,
.slide-far-left-enter-active, .slide-far-right-enter-active {
	transition-delay: .15s;
}

.difficulty-select {
	--base-dist: 30%;
	--base-large-dist: 80%;

	--dist: clamp(1.5rem, var(--base-dist), 6rem);
	--large-dist: clamp(3rem, var(--base-large-dist), 500px);
}

.slide-right-enter-from, .slide-left-leave-to {
	transform: translateX(var(--dist));
	opacity: 0;
}
.slide-right-leave-to, .slide-left-enter-from {
	transform: translateX(calc(-1 * var(--dist)));
	opacity: 0;
}

.slide-far-right-enter-from, .slide-far-left-leave-to {
	transform: translateX(var(--large-dist));
	opacity: 0;
}
.slide-far-right-leave-to, .slide-far-left-enter-from {
	transform: translateX(calc(-1 * var(--large-dist)));
	opacity: 0;
}
</style>