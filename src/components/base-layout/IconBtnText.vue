<template>
	<button class="icon-btn">
		<span class="material-icons" :style="{'--size': size + 'px' }">
			{{icon}}
		</span>
		<div class="whitespace-nowrap">
			<slot />
		</div>
	</button>
</template>

<script>
export default {
	props: {
		size: {
			type: [String, Number],
			default: 24
		},
		icon: {
			type: String,
			required: true
		}
	}
};
</script>

<style lang="postcss" scoped>
.icon-btn {
	@apply flex items-center justify-center rounded-full active:bg-gray-300 outline-none text-current select-none p-3 cursor-pointer;
	-webkit-tap-highlight-color: transparent;
	transition-property: background color opacity;
	transition-duration: 0.15s;
	transition-timing-function: ease;
}

.material-icons {
	font-size: var(--size);
}

@media (hover:hover) and (pointer:fine) {
	.icon-btn {
		@apply hover:bg-gray-200 active:bg-gray-300;
	}
}

.icon-btn:disabled {
	@apply transition-none opacity-80 cursor-default bg-opacity-0;
}
.icon-btn:disabled .material-icons {
	@apply opacity-70;
}
</style>