<template>
	<div class="flex flex-col px-1 justify-center m-auto items-center absolute w-full h-full select-none">
		<div class="stars text-2xl">
			<StarIcon filled v-for="n in fullStars" :key="n" />
			<StarIcon half v-if="halfStar" key="half" />
		</div>
		<div class="label text-lg font-semibold tracking-wide pb-1">
			{{label}}
		</div>
	</div>
</template>

<script setup>
import StarIcon from '../global/StarIcon.vue';
import { computed, toRefs } from 'vue';

const props = defineProps({
	stars: {
		type: Number,
		required: true
	},
	label: {
		type: String,
		required: true
	}
})

const { stars, label } = toRefs(props);

const fullStars = computed(() => Math.floor(stars.value));
const halfStar = computed(() => stars.value - fullStars.value);
</script>

<style scoped>
.stars {
	display: flex;
}
</style>