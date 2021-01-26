<template>
	<button class="icon-btn">
		<span class="material-icons">
			<slot/>
		</span>
	</button>
</template>

<script>
export default {
	
};
</script>

<style lang="postcss" scoped>
.icon-btn {
	@apply w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-300 transition-all outline-none text-current select-none;
	-webkit-tap-highlight-color: transparent;
}

@media (hover:hover) and (pointer:fine) {
	.icon-btn {
		@apply hover:bg-gray-200 active:bg-gray-300;
	}
}
</style>