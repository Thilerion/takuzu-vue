<template>
<li class="w-full fwp-list-item" :class="listItemClasses">
	<component
		:is="tag"
		:class="[contentPaddingClass, {
			'py-2': !noPaddingY,
			'hover-notouch:bg-gray-100': localInteractive,
		}]"
		class="fwp-list-item-wrapper min-h-12 flex items-center w-full"
		v-bind="$attrs"
	>
		<slot />
	</component>
</li>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
	tag?: string | Component,
	listItemClasses?: string | string[],
	noPaddingY?: boolean,
	interactive?: boolean,
}>(), {
	tag: 'div',
	listItemClasses: undefined,
	noPaddingY: false,
	interactive: undefined,
})

const localInteractive = computed(() => {
	if (props.interactive == null) {
		if (props.tag === 'button' || props.tag === 'a' || props.tag === 'router-link') {
			return true;
		}
	}
	return !!props.interactive;
})

defineOptions({
	inheritAttrs: false
})

const contentPaddingClass = ref('px-6');
</script>

<style>
:where(.fwp-list-item-wrapper > *) {
	@apply flex-1;
}
</style>