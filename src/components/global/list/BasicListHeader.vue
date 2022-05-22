<template>
	<component
		:is="elementType"
		class="font-medium text-gray-700/90 tracking-wide px-6 mb-1"
	><slot /></component>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
	level: {
		type: Number,
		default: 2
	}
})
const elementType = computed(() => {
	return `h${props.level}`;
})
</script>

<style scoped>

</style>