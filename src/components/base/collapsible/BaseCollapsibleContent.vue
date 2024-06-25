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
	const result: ExpandTransitionDurationProps = {};
	if ('duration' in props) result.duration = props.duration;
	if ('durationConfig' in props) result.durationConfig = props.durationConfig;
	return result;
})

const {
	isOpen,
	transitionHooks
} = useCollapsible();

defineOptions({
	inheritAttrs: false
})
</script>