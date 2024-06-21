<template>
<component :is="tag">
	<slot
		:toggle
		:is-open="isOpen"
	></slot>
</component>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { ProvideCollapsibleContext } from "./use-collapsible.js";
import { ref } from "vue";

const props = withDefaults(defineProps<{
	defaultOpen?: boolean,
	tag?: string | Component
}>(), {
	defaultOpen: false,
	tag: 'div'
});

const isOpen = ref(props.defaultOpen);
const setIsOpen = (val: boolean) => isOpen.value = val;

const { toggle } = ProvideCollapsibleContext(isOpen, setIsOpen);
</script>