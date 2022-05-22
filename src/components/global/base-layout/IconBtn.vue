<template>
	<button class="icon-btn active:hover-none:bg-gray-300 hover:hover-hover:bg-gray-200 active:hover-hover:bg-gray-300 flex items-center justify-center rounded-full outline-none select-none p-2">
		<slot />
	</button>
</template>

<script>
export default {
	props: {
		size: {
			type: [String, Number],
			default: 24
		},
		scale: {
			type: [String, Number],
			default: '1.25'
		},
		name: {
			type: String,
			// required: true
		},
	},
	computed: {
		sizePx() {
			return this.size + 'px';
		}
	}
};
</script>

<style scoped>
.icon-btn:deep(svg) {
	font-size: calc(v-bind(scale) * 16px);
}
.icon-btn {
	-webkit-tap-highlight-color: transparent;
	transition-property: background color opacity;
	transition-duration: 0.15s;
	transition-timing-function: ease;
}
</style>