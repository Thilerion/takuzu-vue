<template>
	<icon-bx-bxs-star v-if="filled" class="star-icon filled bx" :class="{'uncolored': gray }" />
	<icon-bx-bxs-star-half v-else-if="half" class="star-icon filled bx" :class="{filled, 'uncolored': gray }" />
	<icon-bx-bx-star v-else class="star-icon bx" :class="{'uncolored': gray }" />
</template>

<script setup lang="ts">

export interface Props {
	filled?: boolean,
	half?: boolean,
	gray?: boolean
}
const props = defineProps<Props>();
</script>

<style scoped>
.star-icon {
	@apply text-base;
}
.star-icon:not(.uncolored) {
	@apply text-black dark:text-gray-600;
}
.star-icon.filled:not(.uncolored) {
	@apply dark:text-yellow-400 text-yellow-500;
}
</style>