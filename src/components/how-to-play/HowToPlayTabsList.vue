<template>
	<nav class="mb-4 bg-white">
		<button
			class="px-4 py-2"
			:class="{
				'border-b-2 border-b-red-400': selectedTab === idx
			}"
			v-for="(label, idx) in tabLabels"
			:key="label"
			@click="$emit('update:selected-tab', idx)"
		>{{ label }}</button>
	</nav>
</template>

<script setup lang="ts">
const props = defineProps<{
	selectedTab: number,
	tabLabels: string[]
}>();

const emit = defineEmits<{
	(e: 'update:selected-tab', value: number): void
}>();
</script>

<style scoped>

</style>