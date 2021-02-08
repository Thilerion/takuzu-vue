<template>
	<button
		class="dropdown-item"
	><slot /></button>
</template>

<script>
export default {
};
</script>

<style lang="postcss" scoped>
.dropdown-item {
	@apply pr-12 text-left whitespace-nowrap w-full text-gray-800 text-sm leading-normal relative py-2 pl-4 tracking-wide flex items-center;
	@apply hover-hover:hover:bg-gray-100 hover-hover:hover:text-black;
}
.dropdown-item .icon {
	@apply text-gray-600;
}

.dropdown-item:disabled {
	background-color: transparent;
	@apply  text-gray-500 cursor-default;
}
</style>