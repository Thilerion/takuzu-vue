<template>
	<div class="min-w-min max-w-xs px-2 w-[70vw] mx-auto mb-4">
		<div class="recap-message stats-button-wrapper border-t border-b pt-4 pb-3 border-gray-200 text-center px-2 text-sm">
			<div class="mb-2" v-if="$slots.default"><slot :formatMessage="formatMessage"></slot></div>
			<router-link
				custom
				:to="{ name: 'Statistics', replace: true }"
				v-slot="{ navigate, href }"
			>
				<a class="stats-btn" :href="href" @click.prevent="() => navigationFn({ name: 'Statistics' }, navigate)"><icon-ic-baseline-leaderboard/><span class="text-sm leading-[1.25em] ml-2 overflow-hidden whitespace-nowrap text-ellipsis">{{ $t('Recap.view-all-statistics') }}</span></a>
			</router-link>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { NavigationFailure } from 'vue-router';

const props = defineProps<{
	navigationFn: (to: { name: string }, navigate: () => Promise<void | NavigationFailure>) => void
}>()
// insert non-breaking space to prevent a single word in a line break
const formatMessage = (str = '') => {
	const words = str.split(' ');
	if (words.length < 5) return str;

	const firstWord = words.shift();
	const lastWord = words.pop();

	const middle = words.join(' ');
	return [firstWord, middle, lastWord].join('\xa0');
}
</script>

<style scoped>
.stats-btn {
	@apply mx-auto flex max-w-[66vw] w-full justify-center items-stretch font-medium cursor-pointer py-1 text-gray-700;
}
</style>