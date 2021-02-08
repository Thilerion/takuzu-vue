<template>
	<component :is="element" class="btn"><slot /></component>
</template>

<script>
const baseStyles = ['primary', 'elevated'];
const sizes = ['small', 'medium', 'large'];
function toProps(arr) {
	return arr.reduce((acc, val) => {
		return {
			...acc,
			[val]: Boolean
		}
	}, {});
}

export default {
	name: 'BaseButton',
	props: {
		element: {
			type: String,
			default: 'button'
		},
		...toProps(baseStyles),
		...toProps(sizes),	
	}
};
</script>

<style lang="postcss" scoped>
.btn {
	@apply font-medium rounded bg-white text-gray-800 border border-gray-200 cursor-pointer justify-center px-4 py-2 text-center whitespace-nowrap select-none focus:outline-none ring-blue-600 focus:ring focus:ring-opacity-50 focus-visible:ring focus-visible:ring-opacity-90 hover-hover:hover:bg-gray-200 hover-hover:hover:border-gray-300;
}

.btn-primary {
	@apply bg-blue-500 hover:bg-blue-700 text-white border-0;
}

.btn-elevated {
	@apply hover:bg-gray-100 text-gray-800 font-medium border border-gray-300 rounded shadow;
}
</style>