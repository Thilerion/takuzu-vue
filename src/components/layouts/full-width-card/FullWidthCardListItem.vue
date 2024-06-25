<template>
<li class="fwc-list-item" :class="[paddingXClasses, paddingY]"> 
	<slot />
</li>
</template>

<script setup lang="ts">
import { computed, inject, unref } from 'vue';
import { PADDING_X_CLASS_DEFAULT, PaddingXInjectKey } from './constants.js';

const props = withDefaults(defineProps<{
	paddingY?: string;
	paddingX?: string | undefined;
}>(), {
	paddingY: 'py-4',
	paddingX: undefined,
});

const paddingXInjectedClasses = inject(PaddingXInjectKey, PADDING_X_CLASS_DEFAULT);
const paddingXClasses = computed(() => props.paddingX ?? unref(paddingXInjectedClasses));
</script>

<style scoped>
:where(.fwc-list-item) {
	@apply w-full inline-block;
}
</style>