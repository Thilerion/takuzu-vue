<template>
	<button class="icon-btn" :class="{ vertical }">
		<span class="icon-wrapper">
			<slot name="icon" />
		</span>
		<div class="btn-label whitespace-nowrap">
			<slot />
		</div>
	</button>
</template>

<script>
export default {
	props: {
		scale: {
			type: [Number, String],
			default: '1.25'
		},
		icon: {
			type: String,
			// required: true
		},
		vertical: Boolean
	},
};
</script>

<style scoped>

.icon-wrapper:deep(svg) {
	font-size: calc(v-bind(scale) * 16px);
}

.icon-btn {
	@apply flex items-center justify-center rounded-full active:bg-gray-300 outline-none text-current select-none p-3 cursor-pointer;
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

.icon-btn:disabled {
	@apply transition-none opacity-80 cursor-default bg-transparent;
}
.icon-btn:disabled .icon-svg {
	@apply opacity-70;
}

.icon-btn.vertical {
	@apply flex flex-col justify-start;
}
.icon-btn.vertical > .btn-label {
	@apply mr-0 mt-1;
}
</style>