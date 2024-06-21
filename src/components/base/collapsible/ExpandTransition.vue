<template>
<transition
	name="t-expand"
	@enter="(el) => onEnter(el as HTMLElement)"
	@after-enter="(el) => onAfterEnter(el as HTMLElement)"
	@leave="(el) => onLeave(el as HTMLElement)"
	@after-leave="onAfterLeave"
><template v-if="show"><slot /></template></transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCollapseTransition } from './use-collapse-transition.js';

const props = withDefaults(defineProps<{
	duration?: number,
	durationPer100Px?: number,
	maxDuration?: number,
	show?: boolean
}>(), {
	duration: 500,
	durationPer100Px: undefined,
	maxDuration: 1000,
	show: true
})

const emit = defineEmits(['after-enter', 'after-leave']);

const {
	expectedHeight: baseHeight,
	onEnter, onAfterEnter,
	onLeave, onAfterLeave
} = useCollapseTransition(0, emit);

const duration = computed(() => {
	const baseDuration = (props.durationPer100Px != null && baseHeight.value > 0) ? baseHeight.value / 100 * props.durationPer100Px : props.duration;
	return Math.round(Math.min(baseDuration, props.maxDuration));
})
</script>

<style>
.t-expand-enter-active,
.t-expand-leave-active {
  transition: height calc(v-bind(duration) * 1ms) ease-in-out;
  overflow: hidden;
}

.t-expand-enter-active > * {
	transition: opacity calc(v-bind(duration) * 0.4ms) ease-in-out calc(v-bind(duration) * 0.1ms);
}
.t-expand-leave-active > * {
	transition: opacity calc(v-bind(duration) * 0.4ms) ease-out calc(v-bind(duration) * 0.1ms);
}
.t-expand-enter-from > *,
.t-expand-leave-to > * {
	opacity: 0!important;
}
.t-expand-enter > *,
.t-expand-leave > * {
	opacity: 1!important;
}

.t-expand-enter-from,
.t-expand-leave-to {
  height: 0;
}
</style>

<style scoped>
:slotted(div) {
	@apply transform-gpu will-change-[height];
}
</style>