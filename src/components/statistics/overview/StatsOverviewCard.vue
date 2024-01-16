<template>
	<section
		class="bg-white rounded shadow-lg px-3 flex items-start flex-col justify-around py-2"
	>
		<header class="text-sm tracking-wide text-gray-500">
			<h3><slot name="title"></slot></h3>
		</header>

		<div
			class="text-2xl font-medium flex items-center justify-center py-2 text-teal-500"
		><span>{{value}}</span></div>

		<div
			class="text-xs text-gray-500"
			v-if="!!$slots.footer"
		><slot name="footer"></slot></div>
	</section>
</template>

<script setup lang="ts">

const props = defineProps<{
	value: string | number
}>();
</script>

<style scoped>
</style>