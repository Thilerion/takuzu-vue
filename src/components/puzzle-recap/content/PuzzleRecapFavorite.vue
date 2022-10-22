<template>
	<IconBtn
		@click="$emit('toggle', !props.value)"
		class="text-xxs active:hover-none:bg-gray-300/20"
		scale="0.875"
	><StarIcon :class="{ 'text-gray-400': !value }" :filled="value" :gray="!value" /></IconBtn>
</template>

<script setup lang="ts">
defineEmits<{
	(e: 'toggle', value?: boolean): void
}>();
const props = defineProps<{
	value: boolean
}>();
</script>

<style scoped>

</style>