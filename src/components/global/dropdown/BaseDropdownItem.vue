<template>
	<button
		class="dropdown-item flex"
	>
		<div class="icon-wrapper w-5 h-5 flex items-center justify-center" v-if="$slots.icon"><slot name="icon" /></div>
		<div class="label-wrapper"><slot/></div>
	</button>
</template>

<script setup lang="ts">

</script>

<style scoped>
.dropdown-item {
	@apply pl-4 pr-6 text-left whitespace-nowrap w-full text-gray-800 dark:text-gray-200 text-sm leading-normal relative py-2 tracking-wide flex items-center;
}
.dropdown-item .icon {
	@apply text-gray-600 dark:text-gray-200;
}

.icon-wrapper + .label-wrapper {
	@apply ml-3;
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