<template>
<component :is="tag" class="font-medium text-gray-700/90 dark:text-slate-300 tracking-wide">
	<slot></slot>
</component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	tag?: string
}>(), {
	tag: 'h3'
})
</script>