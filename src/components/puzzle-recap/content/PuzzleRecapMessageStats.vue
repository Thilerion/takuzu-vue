<template>
<div class="min-w-min max-w-xs px-2 w-[70vw] mx-auto mb-4">
	<div class="recap-message stats-button-wrapper border-t border-b pt-4 pb-3 border-gray-200 text-center px-2 text-sm">
		<div v-if="$slots.default" class="mb-2 balance-pretty"><slot></slot></div>
		<router-link
			v-slot="{ navigate, href }"
			custom
			:to="{ name: 'Statistics', replace: true }"
		>
			<a
				class="stats-btn"
				:href="href"
				@click.prevent="() => navigationFn({ name: 'Statistics' }, navigate)"
			><icon-ic-baseline-leaderboard /><span class="text-sm leading-[1.25em] ml-2 overflow-hidden whitespace-nowrap text-ellipsis">{{ $t('Recap.view-all-statistics') }}</span></a>
		</router-link>
	</div>
</div>
</template>

<script setup lang="ts">
import type { NavigationFailure } from 'vue-router';

const props = defineProps<{
	navigationFn: (to: { name: string }, navigate: () => Promise<void | NavigationFailure>) => void
}>()
</script>

<style scoped>
.stats-btn {
	@apply mx-auto flex max-w-[66vw] w-full justify-center items-stretch font-medium cursor-pointer py-1 text-gray-700;
}

.balance-pretty {
	text-wrap: wrap;
	text-wrap: balance;
	text-wrap: pretty;
}
</style>