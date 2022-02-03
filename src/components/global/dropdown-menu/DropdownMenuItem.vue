<template>
	<component
		:is="asElement"
		class="dd-item"
		@click="handleItemClick"
	><slot /></component>
</template>

<script>
export default {
	props: {
		interactive: Boolean,
		asElement: {
			type: String,
			default: 'button'
		}
	},
	emits: ['click'],
	inject: ['closeDropdown'],
	methods: {
		handleItemClick() {
			if (!this.interactive) {
				setTimeout(() => {
					this.closeDropdown();
				}, 67);
			} else {
			}
			this.$emit('click');
		}
	}
};
</script>

<style scoped>
.dd-item {
	@apply pr-12 text-left whitespace-nowrap w-full text-gray-800 text-sm leading-normal relative py-2 pl-4 tracking-wide flex items-center;
	@apply hover-hover:hover:bg-gray-100 hover-hover:hover:text-black;
}
.dd-item .icon {
	@apply text-gray-600;
}

.dd-item:disabled {
	background-color: transparent;
	@apply  text-gray-500 cursor-default;
}
</style>