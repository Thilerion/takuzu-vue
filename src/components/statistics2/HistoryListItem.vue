<template>
	<div
		class="bg-white p-4 py-3 text-sm flex flex-col w-full"
	>
		<div class="flex flex-row items-center justify-between pb-2">
			<div class="text-gray-500">{{dateFormatted}}</div>
			<div class="flex flex-row">
				<IconBtn
					v-if="canDelete"
					class="text-xs"
					@click="initDeleteItem"
					scale="1"
				><icon-ic-outline-delete-forever class="text-gray-500" /></IconBtn>
				<IconBtn
					@click="toggleFavorite"
					class="text-xs"
					scale="1"
				><StarIcon :class="{ 'text-gray-400': !isFavorite }" :filled="isFavorite" :gray="!isFavorite" /></IconBtn>
			</div>
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
				<div class="text-lg text-black">{{timeElapsedFormatted.minsec}}<small
					class="opacity-80"
				>.{{timeElapsedFormatted.ms}}</small></div>
			</div>
		</div>
	</div>
</template>

<script>
import { formatTimeMMSSss } from '@/utils/date.utils.js';
import { computed, ref, toRef, toRefs } from 'vue';

const formatTime = timestampMS => formatTimeMMSSss(timestampMS, { padMinutes: true });
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
import { useAppStore } from '@/stores/app.js';

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

const emit = defineEmits(['favorite', 'delete']);

const {difficulty, dimensions, flags, date, timeElapsed} = toRefs(props);

const forcedFavorite = ref(null);
const isFavorite = computed(() => {
	if (forcedFavorite.value != null) return forcedFavorite.value;
	const favFlag = flags.value?.favorite;
	return !!favFlag;
})
const toggleFavorite = () => {
	const value = isFavorite.value ? !isFavorite.value : !forcedFavorite.value;
	forcedFavorite.value = value;

	emit('favorite', value);
}

const dateFormatted = computed(() => {
	return formatDate(date.value);
})
const timeElapsedFormatted = computed(() => {
	const timeStr = formatTime(timeElapsed.value);
	const [minsec, ms] = timeStr.split('.');
	return {minsec, ms};
})

const appStore = useAppStore();
const canDelete = computed(() => {
	return appStore.debugMode;
})

const initDeleteItem = () => {
	const confirmed = window.confirm('Are you sure? Deleting this history entry can not be undone!');
	if (!confirmed) return;

	emit('delete');
}
</script>

<style scoped>

</style>