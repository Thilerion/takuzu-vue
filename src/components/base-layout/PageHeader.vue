<template>
	<header class="flex justify-center items-stretch h-24 text-gray-700">
		<div class="header-group side left">
			<IconBtn v-if="backBtn">
				arrow_back
			</IconBtn>
		</div>
		<div class="header-group flex justify-center items-center flex-1">
			<h1 class="text-2xl font-bold leading-normal">
				<slot>Page Title</slot>
			</h1>
		</div>
		<div class="header-group side right">

		</div>
	</header>
</template>

<script>
export default {
	props: {
		backBtn: Boolean
	},
};
</script>

<style lang="postcss" scoped>
.header-group {
	@apply flex items-center;
}
.header-group.side {
	@apply w-12 flex-none px-2;
}
.header-group.left {
	@apply justify-center;
}
</style>