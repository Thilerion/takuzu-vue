<template>
<component
	:is="tag"
	class="fwp-title font-medium text-gray-700/90 dark:text-slate-200 tracking-wide"
><slot /></component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	tag?: string
}>(), {
	tag: 'h2'
})
</script>