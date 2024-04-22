<template>
	<component
		:is="elementType"
		class="font-medium text-gray-700/90 dark:text-slate-300 tracking-wide px-6 mb-1"
	><slot /></component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = withDefaults(defineProps<{
	level?: number
}>(), {
	level: 2
})
const elementType = computed(() => {
	return `h${props.level}`;
})
</script>

<style scoped>

</style>