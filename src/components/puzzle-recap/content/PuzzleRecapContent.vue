<template>
	<div class="recap-modal scale-100 min-h-[200px] min-w-min max-w-sm w-full sm:w-max max-h-[90vh] rounded-xl flex flex-col m-auto bg-white text-gray-900 relative">
		<div class="absolute right-1 -top-1 -translate-y-full text-sm flex items-end justify-end z-100 w-full pl-2 h-9">
			<RecapContent.FavoriteNote
				v-if="puzzleRecapStore.isSavedToDb"
				:favorite="puzzleRecapStore.isFavorite"
				:note="note"
				@save-note="puzzleRecapStore.saveNote"
			/>
			<RecapContent.Favorite
				v-if="puzzleRecapStore.isSavedToDb"
				:value="puzzleRecapStore.isFavorite"
				class="ml-auto"
				@toggle="puzzleRecapStore.toggleFavorite"
			/>
		</div>

		<div class="bg-gradient-to-t from-teal-100/70 via-teal-200/20 to-transparent bg-teal-600 text-white relative mb-2 rounded-t-xl" :class="[recordMessage != null ? 'pb-6' : 'pb-2']">
			<div class="h-full absolute inset-0 flex items-end justify-end z-0">
				<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" class="fill-white bottom-0 inset-x-0 h-8 w-full" viewBox="0 0 1440 320"><path fill-opacity="1" d="M0,192L80,213.3C160,235,320,277,480,256C640,235,800,149,960,128C1120,107,1280,149,1360,170.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path></svg>
			</div>

			<div class="relative z-10">
				<RecapContent.PuzzleType
					:width="historyEntry!.width" :height="historyEntry!.height"
					:solved="gameEndStats?.currentCounts.count ?? null"
					:difficulty-stars="historyEntry!.difficulty"
					:difficulty-label="difficultyLabel"
				/>
			</div>
		
			<div class="pb-6 relative z-10">
				<RecapContent.TimeScore>{{formatTimeMMSS(historyEntry?.timeElapsed ?? 0)}}</RecapContent.TimeScore>	
			</div>			
		</div>
		<div class="h-2 relative" v-if="recordMessage != null">
			<div class="w-full -translate-y-full flex items-center justify-center h-10">
				<PuzzleRecapRecordBanner>{{recordMessage ? $t(recordMessage) : undefined}}</PuzzleRecapRecordBanner>
			</div>
		</div>

		<RecapContent.RecapScores
			:data="recapScoresData"
		></RecapContent.RecapScores>

		<RecapContent.MessageStats :navigation-fn="goBackToRoute">
			<template v-if="recapMessage" #default>
				{{$t(recapMessage.key, recapMessage.namedProperties ?? {})}}
			</template>
			<template v-else-if="errorLoading" #default>
				{{  $t('Recap.errorLoadingMessage') }}
			</template>
		</RecapContent.MessageStats>
		

		<div class="recap-btns px-2 mx-auto text-center grid gap-x-2 gap-y-3 mb-4 w-[70vw] min-w-[300px] pt-2">
			<router-link
				custom
				:to="{ name: 'Home', replace: true }"
				v-slot="{ navigate, href }"
			>
				<BaseButton element="a" :href="href" @click.prevent="goBackToRoute({ name: 'Home' }, navigate)" class="text-gray-600 tracking-wider recap-btn text-xs row-span-1">{{ $t('routeButton.home') }}</BaseButton>
			</router-link>
			<router-link
				custom
				:to="{ name: 'NewPuzzleFreePlay', replace: true }"
				v-slot="{ navigate, href }"
			>
				<BaseButton element="a" :href="href" @click.prevent="goBackToRoute({ name: 'NewPuzzleFreePlay' }, navigate)" class="text-gray-600 tracking-wider recap-btn text-xs row-span-1">{{ $t('Recap.change-level') }}</BaseButton>
			</router-link>

			
			<BaseButton class="text-base font-normal h-12 btn-primary row-start-2 col-start-1 col-span-2" @click="$emit('exit-to', 'play-again')">
			<div class="w-full px-8 flex items-center justify-center relative">
				<div>{{ $t('Recap.play-again') }}</div>
				<div class="w-7 h-7 ml-auto absolute right-0 opacity-95"><icon-mdi-arrow-right-thin class="w-full h-full" /></div>
			</div>
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">

import { DIFFICULTY_LABELS } from '@/config';
import { getRecapMessage } from '@/services/puzzle-recap/recapMessage.js';
import type { RecapI18nMessageData } from '@/services/puzzle-recap/types.js';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as RecapContent from './recap-content-elements';
import { formatTimeMMSSWithRounding } from '@/utils/time.utils';
import type { NavigationFailure } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePuzzleRecapStore } from '@/stores/puzzle-recap';
import type { SupportedLocale } from '@/i18n/constants.js';
import { getRecordMessage } from '@/services/puzzle-recap/recordMessage.js';
import type { RecapScoresDataProp } from './PuzzleRecapRecapScores.vue';

const formatTimeMMSS = formatTimeMMSSWithRounding(200);

defineEmits<{
	'exit-to': [exitToRouteName: 'play-again' | 'statistics' | 'home' | 'replay' | 'new-puzzle']
}>();

const puzzleRecapStore = usePuzzleRecapStore();
const { historyEntry, gameEndStats, errorLoading } = storeToRefs(puzzleRecapStore);
const { locale } = useI18n();

// Message data and related code for recap and record message
const messageData = computed(() => {
	const stats = gameEndStats.value;

	if (!stats) {
		return { recapMessage: null, recordMessage: null };
	}

	const recapData = getRecapMessage(stats, (messageType) => {
		// TODO: allow recapMessages that use the replay stats in certain conditions (dev mode? option? when puzzleReplay mode was specifically set by the user? When puzzle was started from the history list?)
		if (messageType === 'replayPlaysTotal' || messageType === 'replayTimeRecord') {
			return false;
		}
		return true;
	});
	const i18nKeyOrObject = recapData.i18nKey(locale.value as SupportedLocale);
	const recapMessage = typeof i18nKeyOrObject === 'string' ? { key: i18nKeyOrObject } : i18nKeyOrObject;

	const recordData = getRecordMessage(recapData.type, stats);
	const recordMessage = recordData?.show ? recordData.key : null;

	return { recapMessage, recordMessage };
})
const recapMessage = computed((): RecapI18nMessageData | null => messageData.value.recapMessage);
const recordMessage = computed((): string | null => messageData.value.recordMessage);


const note = computed(() => {
	// must be computed (not ref), because note property may not be set on the lastPuzzleEntry
	const entry = historyEntry.value;
	if (entry != null && 'note' in entry) {
		return entry.note;
	}
	return undefined;
})

const difficultyLabel = computed(() => {
	return DIFFICULTY_LABELS[historyEntry.value!.difficulty];
})

const recapScoresData = computed((): null | RecapScoresDataProp => {
	if (gameEndStats.value == null) return null;
	return {
		best: gameEndStats.value.personalBest.best.timeElapsed,
		average: gameEndStats.value.averageTimes.weightedAverage,
		previousBest: gameEndStats.value.personalBest.previousBest?.timeElapsed ?? null
	}
})

const route = useRoute();
const router = useRouter();
const goBackToRoute: (to: { name: string }, navigate: () => Promise<void | NavigationFailure>) => void = ({ name }, navigateFn) => {
	const routeMetaPrev = route?.meta?.prev;
	const prevName = routeMetaPrev?.name;
	if (prevName === name) {
		router.go(-1);
	} else {
		navigateFn();
	}
}
</script>

<style scoped>
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