<template>
	<button
		class="dropdown-item"
	><slot /></button>
</template>

<script setup lang="ts">

</script>

<style scoped>
.dropdown-item {
	@apply pr-12 text-left whitespace-nowrap w-full text-gray-800 dark:text-gray-200 text-sm leading-normal relative py-2 pl-4 tracking-wide flex items-center;
}
.dropdown-item .icon {
	@apply text-gray-600 dark:text-gray-200;
}

.dropdown-item:disabled {
	background-color: transparent;
	@apply  text-gray-500 cursor-default dark:text-gray-300/80;
}
.dropdown-item:not(:disabled) {
		@apply hover-hover:hover:bg-gray-100 hover-hover:hover:text-black;
	@apply dark:hover-hover:hover:bg-slate-700 dark:hover-hover:hover:text-slate-100;
}
</style>