<template>
	<component :is="element" class="btn"><slot /></component>
</template>

<script>
export default {
	name: 'BaseButton',
	props: {
		element: {
			type: String,
			default: 'button'
		}
	}
};
</script>

<style lang="postcss" scoped>
.btn {
	@apply font-bold rounded bg-white text-gray-800 border border-gray-200 cursor-pointer justify-center px-4 py-2 text-center whitespace-nowrap select-none;
}

.btn-primary {
	@apply bg-blue-500 hover:bg-blue-700 text-white border-0;
}
</style>