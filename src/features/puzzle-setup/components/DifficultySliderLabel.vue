<template>
<div class="flex flex-col px-1 justify-center m-auto items-center absolute w-full h-full select-none">
	<div class="flex text-2xl">
		<StarIcon
			v-for="n in fullStars"
			:key="n"
			filled
		/>
		<StarIcon
			v-if="halfStar"
			key="half"
			half
		/>
	</div>
	<div class="label text-lg font-semibold tracking-wide pb-1">
		{{ t(`Game.difficulty.${label}`, label) }}
	</div>
</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, toRefs } from 'vue';

const props = defineProps<{
	stars: number,
	label: string
}>();

const { stars, label } = toRefs(props);
const { t } = useI18n();

const fullStars = computed(() => Math.floor(stars.value));
const halfStar = computed(() => stars.value - fullStars.value);
</script>