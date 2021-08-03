<template>
	<VIcon class="star-icon" :class="{ filled }" name="md-starrate" />
</template>

<script>
import VIcon from "oh-vue-icons/dist/v3/icon.es";
import { MdStarrate } from 'oh-vue-icons/icons';
VIcon.add(MdStarrate);

export default {
	components: {
		VIcon
	},
	props: {
		filled: Boolean
	}
};
</script>

<style lang="postcss" scoped>
.star-icon {
	@apply text-black dark:text-gray-600;
}
.star-icon.filled {
	@apply dark:text-yellow-400 text-yellow-500;
}
</style>