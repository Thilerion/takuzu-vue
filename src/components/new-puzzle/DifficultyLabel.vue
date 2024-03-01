<template>
	<div class="flex flex-col px-1 justify-center m-auto items-center absolute w-full h-full select-none">
		<div class="stars text-2xl">
			<StarIcon filled v-for="n in fullStars" :key="n" />
			<StarIcon half v-if="halfStar" key="half" />
		</div>
		<div class="label text-lg font-semibold tracking-wide pb-1">
			{{ $t(`Game.difficulty.${label}`, label)}}
		</div>
	</div>
</template>

<script setup lang="ts">

import { computed, toRefs } from 'vue';

const props = defineProps<{
	stars: number,
	label: string
}>();

const { stars, label } = toRefs(props);

const fullStars = computed(() => Math.floor(stars.value));
const halfStar = computed(() => stars.value - fullStars.value);
</script>

<style scoped>
.stars {
	display: flex;
}
</style>