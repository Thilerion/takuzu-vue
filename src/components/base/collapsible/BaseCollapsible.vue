<template>
<component :is="tag">
	<slot
		:toggle
		:is-open="isOpen"
	></slot>
</component>
</template>

<script setup lang="ts">
import { ProvideCollapsibleContext, type BaseCollapsibleEmits } from "./use-collapsible.js";
import { ref, type Component } from "vue";

const props = withDefaults(defineProps<{
	defaultOpen?: boolean,
	tag?: string | Component
}>(), {
	defaultOpen: false,
	tag: 'div'
});

const emit = defineEmits<BaseCollapsibleEmits>();

const isOpen = ref(props.defaultOpen);

const { toggle } = ProvideCollapsibleContext(isOpen, emit);
</script>