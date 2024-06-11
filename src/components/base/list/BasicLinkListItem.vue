<template>
<li class="link-list-item" :class="wrapperClasses">
	<slot>List item</slot>
</li>
</template>

<script setup lang="ts">
defineOptions({
	inheritAttrs: false
})

const props = defineProps<{
	wrapperClasses?: string[] | Record<string, unknown> | string
}>();
</script>

<style scoped>
:slotted(a) {
	@apply w-full inline-block;
}

:where(.link-list-item) {
	@apply flex w-full items-center justify-start px-2 py-4 h-14;
}
</style>