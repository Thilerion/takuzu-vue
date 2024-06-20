<template>
<div class="bg-white rounded-xl fw-card-content-shadow" :class="[paddingXClasses, paddingY]">
	<slot></slot>
</div>
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
.fw-card-content-shadow {
	box-shadow: rgba(0, 0, 0, 0.05) 0px 5px 20px, 0 8px 15px -2px rgb(0 0 0 / 0.04);
}
</style>