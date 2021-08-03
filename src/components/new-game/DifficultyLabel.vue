<template>
	<div class="flex flex-col px-1 justify-center m-auto items-center absolute w-full h-full select-none">
		<div class="stars text-2xl">
			<StarIcon filled v-for="n in stars" :key="n" />
		</div>
		<div class="label text-lg font-semibold tracking-wide pb-1">
			{{label}}
		</div>
	</div>
</template>

<script>
import StarIcon from '@/components/common/StarIcon.vue';

export default {
	components: {
		StarIcon,
	},
	props: {
		stars: {
			type: Number,
			required: true
		},
		label: {
			type: String,
			required: true
		}
	}
};
</script>

<style lang="postcss" scoped>
.stars {
	display: flex;
}
</style>