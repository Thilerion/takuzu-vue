<template>
<div class="flex flex-col w-full gap-y-6 bg-gray-50 mt-4 pb-2">
	<slot></slot>
</div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { type PaddingXClassValue, PaddingXInjectKey, PADDING_X_CLASS_DEFAULT } from './constants.js'; 

const props = withDefaults(defineProps<{
	paddingX?: PaddingXClassValue;
}>(), {
	paddingX: PADDING_X_CLASS_DEFAULT
});

const paddingXClasses = computed(() => props.paddingX);
provide(PaddingXInjectKey, paddingXClasses);
</script>