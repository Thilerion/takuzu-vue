<template>
<nav class="bg-white dark:bg-slate-800 flex gap-x-2">
	<router-link
		v-for="tab in tabs"
		:key="tab.routeName"
		class="px-3 py-2 inline-block"
		exact-active-class="border-b-2 border-b-teal-400 text-teal-600 dark:border-b-teal-300 dark:text-teal-300"
		:to="{ name: tab.routeName }"
	>{{ tab.label.value }}</router-link>
</nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const tabs = [
	{
		label: computed(() => t('HowToPlay.tabs.overview')),
		routeName: 'HowToPlayOverview'
	},
	{
		label: computed(() => t('HowToPlay.tabs.rules')),
		routeName: 'PuzzleRulesInfo'
	},
	{
		label: computed(() => t('HowToPlay.tabs.basic-techniques')),
		routeName: 'BasicTechniques'
	},
	{
		label: computed(() => t('HowToPlay.tabs.advanced-techniques')),
		routeName: 'AdvancedTechniques',
		enabled: false
	}
].filter(tab => {
	return (tab?.enabled ?? true);
})

</script>
