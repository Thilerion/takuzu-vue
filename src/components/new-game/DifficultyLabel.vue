<template>
	<div class="flex flex-col px-1 justify-center m-auto items-center absolute w-full h-full select-none">
		<div class="stars text-2xl">
			<StarIcon filled v-for="n in full" :key="n" />
			<StarIcon half v-if="half" key="half" />
		</div>
		<div class="label text-lg font-semibold tracking-wide pb-1">
			{{label}}
		</div>
	</div>
</template>

<script>
import StarIcon from '@/components/global/StarIcon.vue';
import { computed, toRefs } from 'vue';

export default {
	props: {
		stars: {
			type: Number,
			required: true
		},
		label: {
			type: String,
			required: true
		}
	},
	setup(props) {
		const { stars, label } = toRefs(props);

		const fullStars = computed(() => Math.floor(stars.value));
		const halfStar = computed(() => stars.value - fullStars.value);

		return { label, full: fullStars, half: halfStar };
	}
}
</script>

<style scoped>
.stars {
	display: flex;
}
</style>