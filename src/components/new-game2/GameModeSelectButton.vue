<template>
	<button
		class="
			relative px-2 h-10 w-28 flex justify-center items-center border flex-shrink-0 border-b-0
			first:rounded-tl-md first:border-r-0
			text-teal-600 font-medium
			last:rounded-tr-md bg-gray-50/80 tracking-wider hover-hover:hover:bg-gray-50"
		:class="{ selected }"
	><slot /></button>
</template>

<script setup>
defineProps({
	selected: Boolean,
});
</script>

<style scoped>
button.selected {
	@apply bg-white text-black hover-hover:hover:bg-white hover-hover:hover:text-black cursor-default;
}
button:not(.selected) {
	@apply hover-hover:hover:text-teal-800 cursor-pointer;
}
</style>