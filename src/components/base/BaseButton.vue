<template>
<component
	:is="element"
	class="btn"
	:class="{
		'btn-primary': primary,
		'btn-elevated': elevated,
		'btn-icon-only': iconOnly,
	}"
><slot /></component>
</template>

<script setup lang="ts">
export type Props = {
	element?: 'button' | 'a',
	primary?: boolean,
	elevated?: boolean,
	iconOnly?: boolean,
}
const props = withDefaults(
	defineProps<Props>(), {
		element: 'button',
		primary: false,
		elevated: false,
	}
)
</script>

<style scoped>
.btn {
	@apply font-medium rounded bg-white text-gray-600 border border-gray-200 cursor-pointer justify-center px-4 py-2 text-center whitespace-nowrap select-none ring-teal-500;

	@apply dark:bg-slate-800 dark:text-gray-100 dark:border-gray-200/70;
	

	@apply focus:outline-none;
	@apply hover-none:active:ring hover-none:active:ring-opacity-50 hover-hover:focus:ring hover-hover:focus:ring-opacity-50;
	@apply focus-visible:ring focus-visible:ring-opacity-90;
	@apply hover-hover:hover:bg-gray-50 hover-hover:hover:border-gray-400 hover-none:active:bg-gray-50 hover-none:active:border-gray-400;
	@apply dark:hover-hover:hover:bg-slate-700 dark:hover-none:active:bg-slate-700;

	@apply disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-auto disabled:hover-hover:hover:border-transparent disabled:border-transparent;
	@apply dark:disabled:bg-slate-700 dark:disabled:text-slate-400 dark:disabled:border-transparent;
}
.btn-icon-only {
	@apply p-0;
}

.btn-primary {
	@apply bg-teal-600 dark:bg-teal-600 text-white dark:text-white border-transparent dark:border-transparent;
	@apply hover-hover:hover:bg-teal-800 hover-none:active:bg-teal-800;
	@apply dark:hover-hover:hover:bg-teal-500 dark:hover-none:active:bg-teal-500;
	@apply tracking-wide;
}

.btn-elevated {
	@apply hover-hover:hover:bg-gray-100 hover-hover:hover:shadow-md text-gray-800 font-medium border border-gray-300 rounded shadow;
}

.btn-primary:disabled {
	@apply bg-gray-600 opacity-60;
}
</style>