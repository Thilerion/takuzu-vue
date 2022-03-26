<template>
	<div
		class="bg-white p-4 py-3 text-sm flex flex-col"
	>
		<div class="flex flex-row items-center justify-between pb-2">
			<div class="text-gray-500">{{dateFormatted}}</div>
			<IconBtn
				@click="toggleFavorite"
				class="text-xs"
				scale="1"
			><StarIcon :class="{ 'text-gray-400': !isFavorite }" :filled="isFavorite" :gray="!isFavorite" /></IconBtn>
		</div>
		<div class="flex flex-row gap-6 justify-start">
			<div class="flex flex-col w-1/4">
				<div class="text-sm text-gray-600">Size</div>
				<div class="text-lg text-black">{{dimensions}}</div>
			</div>
			<div class="flex flex-col w-1/4">
				<div class="text-sm text-gray-600">Difficulty</div>
				<div class="text-lg text-black">{{difficulty}}*</div>
			</div>
			<div class="flex flex-col w-1/3">
				<div class="text-sm text-gray-600">Time</div>
				<div class="text-lg text-black">{{timeElapsedFormatted}}</div>
			</div>
		</div>
	</div>
</template>

<script>
import { timeFormatter } from '@/utils/date.utils.js';
import { computed, ref, toRef, toRefs } from 'vue';

const formatTime = timeFormatter({});
const dateTimeOpts = {
	weekday: 'short',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric'
}
const formatDate = (date) => date.toLocaleString(undefined, dateTimeOpts);

export default {
	inheritAttrs: false
}
</script>

<script setup>
import StarIcon from '../global/StarIcon.vue';
import IconBtn from '../global/base-layout/IconBtn.vue';

const props = defineProps({
	difficulty: [Number, String],
	dimensions: String,
	flags: {
		type: Object,
		default: () => ({})
	},
	date: Date,
	timeElapsed: Number
})

const {difficulty, dimensions, flags, date, timeElapsed} = toRefs(props);

const forcedFavorite = ref(null);
const isFavorite = computed(() => {
	if (forcedFavorite.value != null) return forcedFavorite.value;
	return flags?.favorite ?? false;
})
const toggleFavorite = () => {
	if (isFavorite.value) {
		forcedFavorite.value = false;
	} else forcedFavorite.value = true;
	console.warn('TODO: mark favorite in store and in database.');
}

const dateFormatted = computed(() => {
	return formatDate(date.value);
})
const timeElapsedFormatted = computed(() => {
	return formatTime(timeElapsed.value);
})
</script>

<style scoped>

</style>