<template>
	<div
		class="star-icon"
		:class="{ filled }"
	>&#x2605;</div>
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
	@apply text-black dark:text-warmgray-600;
}
.star-icon.filled {
	@apply dark:text-yellow-400 text-yellow-500;
}
</style>