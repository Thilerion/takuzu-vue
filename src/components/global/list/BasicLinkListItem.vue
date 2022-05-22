<template>
	<li class="link-list-item flex w-full items-center justify-start px-2 py-4" :class="wrapperClasses">
		<slot>List item</slot>
	</li>
</template>

<script>
export default {
	inheritAttrs: false
}
</script>

<script setup>
const props = defineProps({
	wrapperClasses: {
		type: [Array, Object, String]
	}
})
</script>

<style scoped>
:slotted(a) {
	@apply w-full inline-block;
}
</style>