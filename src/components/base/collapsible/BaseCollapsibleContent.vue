<template>
<ExpandTransition
	:show="isOpen"
	@after-enter="$emit('after-enter')"
	@after-leave="$emit('after-leave')"
>
	<div v-bind="$attrs">
		<slot></slot>
	</div>
</ExpandTransition>
</template>

<script setup lang="ts">
import { useCollapsible } from './use-collapsible.js';

const { isOpen } = useCollapsible();

const emit = defineEmits(['after-enter', 'after-leave']);

// Disable Vue's inheritAttrs
defineOptions({
	inheritAttrs: false
})
</script>