<template>
	<div class="recap-modal scale-100 min-h-[200px] min-w-min max-w-sm w-full sm:w-max max-h-[90vh] rounded-xl flex flex-col m-auto bg-white text-gray-900 relative" v-if="initialized && data != null">
		<div class="absolute right-1 -top-1 -translate-y-full text-sm flex items-end justify-end z-100 w-full pl-2 h-9">
			<PuzzleRecapFavoriteNote
				v-if="data.isSavedToDb"
				:favorite="data.isFavorite"
				:note="data.note"
				@save-note="recapStatsStore.saveNote"
			/>
			<PuzzleRecapFavorite
				v-if="data.isSavedToDb"
				:value="data.isFavorite"
				class="ml-auto"
				@toggle="recapStatsStore.toggleFavorite"
			/>
		</div>
	
		<div
			class="bg-gradient-to-t from-teal-100/70 via-teal-200/20 to-transparent bg-teal-600 text-white relative mb-2 rounded-t-xl"
			:class="[hasRecordBanner ? 'pb-6' : 'pb-2']"
		>
			<div class="h-full absolute inset-0 flex items-end justify-end z-0">
				<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" class="fill-white bottom-0 inset-x-0 h-8 w-full" viewBox="0 0 1440 320"><path fill-opacity="1" d="M0,192L80,213.3C160,235,320,277,480,256C640,235,800,149,960,128C1120,107,1280,149,1360,170.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path></svg>
			</div>
			<div class="relative z-10">
				<PuzzleRecapPuzzleType
					:width="data.width" :height="data.height"
					:solved="data.count"
					:difficulty-stars="data.difficulty"
					:difficulty-label="difficultyLabel!"
				/>
			</div>
			<div class="pb-6 relative z-10">
				<PuzzleRecapTimeScore
					:time-elapsed="data.currentTimeElapsed"
				/>
			</div>
		</div>
	
		<div class="h-2 relative" v-if="hasRecordBanner && recordData !== false">
			<div class="w-full -translate-y-full flex items-center justify-center h-10">
				<PuzzleRecapRecordBanner
					v-bind="recordData"
				/>
			</div>
		</div>
		<PuzzleRecapRecapScores
			:best="data.best"
			:previous-best="data.previousBest"
			:average="data.average"
		></PuzzleRecapRecapScores>
	
		<PuzzleRecapMessageStats :navigation-fn="goBackToRoute">
			<template v-if="recapMessage" #default="{formatMessage}">
				{{formatMessage(recapMessage)}}
			</template>
		</PuzzleRecapMessageStats>
	
		<div class="recap-btns px-2 mx-auto text-center grid gap-x-2 gap-y-3 mb-4 w-[70vw] min-w-[300px] pt-2">
			<router-link
				custom
				:to="{ name: 'Home', replace: true }"
				v-slot="{ navigate, href }"
			>
				<BaseButton element="a" :href="href" @click.prevent="goBackToRoute({ name: 'Home' }, navigate)" class="text-gray-600 tracking-wider recap-btn text-xs row-span-1">Home</BaseButton>
			</router-link>
			<router-link
				custom
				:to="{ name: 'NewPuzzleFreePlay', replace: true }"
				v-slot="{ navigate, href }"
			>
				<BaseButton element="a" :href="href" @click.prevent="goBackToRoute({ name: 'NewPuzzleFreePlay' }, navigate)" class="text-gray-600 tracking-wider recap-btn text-xs row-span-1">Change Level</BaseButton>
			</router-link>
	
			
			<BaseButton class="text-base font-normal h-12 btn-primary row-start-2 col-start-1 col-span-2" @click="$emit('exit-to', 'play-again')">
			<div class="w-full px-8 flex items-center justify-center relative">
				<div>Play again</div>
				<div class="w-7 h-7 ml-auto absolute right-0 opacity-95"><icon-mdi-arrow-right-thin class="w-full h-full" /></div>
			</div>
			</BaseButton>
		</div>
	
	</div>
	</template>
	
	<script setup lang="ts">
	import { DIFFICULTY_LABELS } from '@/config';
	import { getRecapData } from '@/services/recap-message-ts';
	import { useRecapStatsStore } from '@/stores/recap-stats';
	import { computed, ref, toRefs, watch, watchEffect } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import { useRecapData } from './getRecapData';
	
	defineEmits(['exit-to']);
	
	const recapStatsStore = useRecapStatsStore();
	const recapData = useRecapData();
	const { data, initialized } = toRefs(recapData);
	
	const recapMessageData = ref<null | ReturnType<typeof getRecapData>>(null);
	
	const recapMessage = computed(() => recapMessageData.value?.message);
	const recordData = computed(() => recapMessageData.value?.record ?? false)
	const hasRecordBanner = computed(() => recordData.value !== false);
	const recordMessage = ref<string | null>(null);
	watchEffect(() => {
		const msg = recordData.value == false ? null : recordData.value.getMessage();
		recordMessage.value = msg;
	})
	
	const difficultyLabel = computed(() => data.value == null ? null : DIFFICULTY_LABELS[data.value.difficulty])
	
	watch(initialized, (value) => {
		if (!value) {
			recapMessageData.value = null;
			return;
		} else {
			// @ts-ignore recapStatsStore does have correct data
			recapMessageData.value = getRecapData(recapStatsStore);
		}
	}, { immediate: true });
	
	const route = useRoute();
	const router = useRouter();
	const goBackToRoute = ({ name }: { name: string }, navigateFn: () => void) => {
		const routeMetaPrev = route?.meta?.prev as Partial<Record<string, string>>;
		const prevName = routeMetaPrev?.name;
		if (prevName === name) {
			router.go(-1);
		} else {
			navigateFn();
		}
	}
	
	</script>
	
	<style>
	.recap-btns {
		max-width: min(468px, 100%);
		grid-template-rows: auto auto;
		grid-template-columns: 1fr 1fr;
		@apply text-lg w-fit max-w-full;
	}
	
	.recap-btns * {
		@apply font-normal;
	}
	
	.recap-btn {
		@apply border border-gray-300/80 rounded py-0 h-8 flex items-center justify-center pt-1;
	}
	
	.fav-btn {
		transition: opacity 1s, color 1s;
	}
	.fav-btn:active {
		opacity: 0.9;
		color: white;
		transition: opacity .2s, color .2s;
	}
	.fav-btn:active.is-fav {
		@apply opacity-100;
	}
	</style>