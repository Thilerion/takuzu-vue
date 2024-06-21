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
import { watchEffect } from 'vue';

export type ExpandTransitionDurationConfig = {
	/** Maximum duration of the transition in milliseconds */
	max: number;
	/** Height at which maxDuration is reached */
	maxAtHeight: number;
	/** Minimum duration of the transition in milliseconds */
	min: number;
}
export type ExpandTransitionProps = {
	/** Whether the transition is currently open */
	show: boolean;
	/** Duration of the transition in milliseconds */
	duration?: number;
	/** Advanced duration configuration, which overrides duration */
	durationConfig?: ExpandTransitionDurationConfig;
}
export type ExpandTransitionDurationProps = Pick<ExpandTransitionProps, 'durationConfig' | 'duration'>;

const props = withDefaults(defineProps<ExpandTransitionProps>(), {
	duration: 500,
	show: true,
	durationConfig: undefined
})

const useDurationConfig = computed((): null | ExpandTransitionDurationConfig => {
	if (props.durationConfig != null) return props.durationConfig;
	return null;
})

const emit = defineEmits(['after-enter', 'after-leave']);

const {
	expectedHeight: baseHeight,
	onEnter, onAfterEnter,
	onLeave, onAfterLeave
} = useCollapseTransition(0, emit);

const durationMs = computed((): number => {
	if (useDurationConfig.value == null) return props.duration;
	return calculateDuration(baseHeight.value, useDurationConfig.value!);
})

watchEffect(() => {
	console.log({ durationMs: durationMs.value });
})

function calculateDuration(
	height: number,
	conf: ExpandTransitionDurationConfig
): number {
	const { max, maxAtHeight, min } = conf;
    const normalizedHeight = Math.min(height, maxAtHeight) / maxAtHeight;
    return min + (max - min) * Math.log1p(normalizedHeight) / Math.log1p(1);
}
</script>

<style>
.t-expand-enter-active,
.t-expand-leave-active {
  transition: height calc(v-bind(durationMs) * 1ms) ease-in-out;
  overflow: hidden;
}

.t-expand-enter-active > * {
	animation: innerFadeIn calc(v-bind(durationMs) * 1ms);
}
.t-expand-leave-active > * {
	animation: innerFadeOut calc(v-bind(durationMs) * 1ms);
}

@keyframes innerFadeIn {
	0% {
		opacity: 0;
	}
	20% {
		opacity: 0;
	}
	80% {
		opacity: 1;
	}
	100% {
		opacity: 1;
	}
}
@keyframes innerFadeOut {
	0% {
		opacity: 1;
	}
	60% {
		opacity: 0;
	}
	100% {
		opacity: 0;
	}
}

.t-expand-enter-from,
.t-expand-leave-to {
  height: 0;
}
</style>

<style scoped>
/* Targets the slotted element only */
* {
	@apply transform-gpu will-change-[height];
}
</style>