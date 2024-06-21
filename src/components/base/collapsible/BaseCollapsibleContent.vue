<template>
<ExpandTransition
	v-bind="transitionProps"
	:show="isOpen"
	@after-enter="transitionHooks.afterEnter"
	@after-leave="transitionHooks.afterLeave"
>
	<div v-bind="$attrs">
		<slot></slot>
	</div>
</ExpandTransition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ExpandTransitionDurationProps } from './ExpandTransition.vue';
import { useCollapsible } from './use-collapsible.js';

const props = defineProps<ExpandTransitionDurationProps>();
const transitionProps = computed((): ExpandTransitionDurationProps => {
	return {
		duration: props.duration,
		durationPer100Px: props.durationPer100Px,
		maxDuration: props.maxDuration,
	}
})

const {
	isOpen,
	transitionHooks
} = useCollapsible();

// Disable Vue's inheritAttrs
defineOptions({
	inheritAttrs: false
})
</script>