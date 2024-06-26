<template>
<icon-ic-outline-keyboard-arrow-down
	class="ml-auto transition-transform duration-500 text-base"
	:class="{ 'rotate-180': open }"
/>
</template>

<script setup lang="ts">
defineProps<{
	open: boolean
}>();
</script>