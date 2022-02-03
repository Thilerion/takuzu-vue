<template>
	<icon-bx-bxs-star v-if="filled" class="star-icon filled bx" />
	<icon-bx-bxs-star-half v-else-if="half" class="star-icon filled bx" :class="{filled}" />
	<icon-bx-bx-star v-else class="star-icon bx" />
</template>

<script>

export default {
	props: {
		filled: Boolean,
		half: Boolean
	}
};
</script>

<style scoped>
.star-icon {
	@apply text-black dark:text-gray-600 text-base;
}
.star-icon.filled {
	@apply dark:text-yellow-400 text-yellow-500;
}
</style>