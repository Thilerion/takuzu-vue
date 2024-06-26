<template>
<component :is="tag">
	<slot
		:toggle="toggle"
		:is-open="isOpenComputed"
	></slot>
</component>
</template>

<script setup lang="ts">
import { ProvideCollapsibleContext, type BaseCollapsibleEmits } from "./use-collapsible.js";
import { ref, computed, watch, type Component } from "vue";

const props = withDefaults(defineProps<{
	defaultOpen?: boolean,
	tag?: string | Component
}>(), {
	defaultOpen: false,
	tag: 'div'
});

const emit = defineEmits<BaseCollapsibleEmits>();
const modelValue = defineModel<boolean | undefined>({ default: undefined });

const isControlled = modelValue.value !== undefined;
const isOpenInternal = ref(props.defaultOpen);

const isOpenComputed = computed({
	get: () => isControlled ? modelValue.value! : isOpenInternal.value,
	set: (value) => {
		if (isControlled) {
			modelValue.value = value;
		} else {
			isOpenInternal.value = value;
		}
	}
});

watch(() => modelValue.value, (newValue) => {
	if (isControlled && newValue !== undefined) {
		isOpenComputed.value = newValue;
	}
});

const { toggle } = ProvideCollapsibleContext(isOpenComputed, emit);
</script>