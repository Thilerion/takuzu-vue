<template>
	<button
		class="select-btn"
		:class="{ selected }"
	><slot /></button>
</template>

<script>
export default {
	props: {
		selected: Boolean,
	},
};
</script>

<style scoped>
.select-btn {
	@apply text-sm font-bold py-1 px-4 rounded mb-2 tracking-wider bg-white text-gray-700 shadow border border-gray-300 transition-all dark:bg-slate-800 dark:text-gray-150 dark:border-gray-300/70;
	@apply focus:outline-none;
}
.select-btn.selected {
	@apply bg-teal-600 text-white border-teal-600 shadow-md dark:shadow-none dark:bg-teal-500 dark:border-teal-500;
}
.select-btn:disabled {
	@apply opacity-50 bg-gray-300 shadow-none dark:text-black;
}
</style>