<template>
	<button class="icon-btn">
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
		}
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
	@apply flex items-center justify-center rounded-full active:bg-gray-300 outline-none text-current select-none p-2;
	-webkit-tap-highlight-color: transparent;
	transition-property: background color opacity;
	transition-duration: 0.15s;
	transition-timing-function: ease;
}

@media (hover:hover) and (pointer:fine) {
	.icon-btn {
		@apply hover:bg-gray-200 active:bg-gray-300;
	}
}
</style>