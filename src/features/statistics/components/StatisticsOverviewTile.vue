<template>
<section
	class="bg-white dark:bg-slate-700 dark:text-slate-100 rounded shadow-lg px-3 tile-inner-grid py-2"
>
	<header class="text-sm tracking-wide text-gray-500 dark:text-slate-100">
		<h3><slot name="title"></slot></h3>
	</header>

	<div
		class="text-2xl font-medium flex items-center justify-center py-2 text-teal-500 dark:text-teal-300"
	><span>{{ value }}</span></div>

	<div
		class="text-xs text-gray-500 dark:text-slate-100 self-end"
	><slot name="footer"></slot></div>
</section>
</template>

<script setup lang="ts">
defineProps<{
	value: string | number
}>();
</script>

<style scoped>
.tile-inner-grid {
	@apply grid auto-rows-auto grid-cols-1 justify-items-start;
}
</style>