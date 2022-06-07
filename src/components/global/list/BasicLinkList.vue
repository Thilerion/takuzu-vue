<template>
	<ul
		class="divide-y divide-gray-150 bg-white dark:divide-slate-700 dark:bg-slate-800 px-4 rounded-xl link-list-shadow"
	>
		<slot>List goes here</slot>
	</ul>
</template>

<script setup>

</script>

<style scoped>
.link-list-shadow {
	box-shadow: rgba(0, 0, 0, 0.05) 0px 5px 20px, 0 8px 15px -2px rgb(0 0 0 / 0.04);
}
</style>