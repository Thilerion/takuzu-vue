<template>
	<div
		role="checkbox"
		tabindex="0"
		:aria-checked="modelValue"
		class="toggle-wrapper"
		:class="{ checked: !!modelValue, 'inline-flex': inline, 'flex': !inline, small }"
		@click="toggle"
	>
		<input type="hidden" v-bind="$attrs" :value="modelValue">
		<span class="toggle-slider"></span>
	</div>
</template>

<script>
export default {
	props: {
		modelValue: {
			type: Boolean
		},
		inline: {
			type: Boolean,
			default: false
		},
		small: {
			type: Boolean
		}
	},
	inheritAttrs: false,
	emits: ['update:modelValue'],
	methods: {
		toggle() {
			this.$emit('update:modelValue', !this.modelValue);
		}
	}
};
</script>

<style lang="postcss" scoped>
.toggle-wrapper {
	aspect-ratio: 2;
	@apply relative rounded-full bg-gray-500 focus:outline-none transition-colors justify-start items-center;
	width: 36px;
	height: 20px;
	padding: 2px;
}

.toggle-wrapper.small {
	width: 26px;
	height: 15px;
}

.toggle-slider {
	transition: all .2s ease;
	width: 16px;
	height: 16px;
	@apply rounded-full bg-white shadow;
}
.checked.toggle-wrapper {
	@apply bg-blue-500;
}
.checked .toggle-slider {
	transform: translateX(calc(100%)) scale(1.1);
}

.small .toggle-slider {
	width: 11px;
	height: 11px;
}
</style>