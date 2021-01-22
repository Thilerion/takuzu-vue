<template>
	<div
		class="star-icon"
		:class="{ filled }"
	>&#x2605;</div>
	<!-- <span
		v-else
		class="star-icon"
	>&#x2606;</span> -->
</template>

<script>
export default {
	props: {
		filled: Boolean
	}
};
</script>

<style lang="postcss" scoped>
.star-icon {
	@apply text-black dark:text-warmgray-600 bg-yellow-700;
}
.star-icon.filled {
	@apply text-yellow-400;
}
</style>